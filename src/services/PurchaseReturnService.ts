import { Prisma } from '@prisma/client';
import { conflict, notFound } from '../errors/AppError';
import type { IPurchaseReturnRepository } from '../repositories/PurchaseReturnRepository';
import type { InventoryService } from './InventoryService';
import type { AuthUser } from '../types/auth';
import { calculateLineTotals, roundMoney, toDecimal } from '../utils/money';
import { assertPermission } from '../utils/permissions';
import type {
  CreatePurchaseReturnInput,
  PurchaseReturnItemInput,
  PurchaseReturnListQuery,
  UpdatePurchaseReturnInput,
} from '../validators/purchaseReturn.schemas';

function buildReturnNumber(input?: string): string {
  return input?.trim() || `PRT-${Date.now()}`;
}

function summarizeItems(items: PurchaseReturnItemInput[]) {
  let subtotal = new Prisma.Decimal(0);
  let taxAmount = new Prisma.Decimal(0);
  let totalAmount = new Prisma.Decimal(0);

  const normalized = items.map((item) => {
    const totals = calculateLineTotals({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
    });
    subtotal = subtotal.add(totals.lineSubtotal);
    taxAmount = taxAmount.add(totals.taxAmount);
    totalAmount = totalAmount.add(totals.lineTotal);
    return {
      ...item,
      taxAmount: Number(totals.taxAmount),
      lineTotal: Number(totals.lineTotal),
    };
  });

  return {
    items: normalized,
    subtotal: roundMoney(subtotal),
    taxAmount: roundMoney(taxAmount),
    totalAmount: roundMoney(totalAmount),
  };
}

export class PurchaseReturnService {
  constructor(
    private readonly returns: IPurchaseReturnRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async list(user: AuthUser, query: PurchaseReturnListQuery) {
    assertPermission(user, 'purchase.view');
    return this.returns.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'purchase.view');
    const item = await this.returns.findById(user.companyId, id);
    if (!item) {
      throw notFound('Purchase return not found');
    }
    return item;
  }

  async create(user: AuthUser, input: CreatePurchaseReturnInput) {
    assertPermission(user, 'purchase.manage');
    const summary = summarizeItems(input.items);
    const status = input.status ?? 'DRAFT';

    const db = this.returns.getClient();
    return db.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({
        where: { id: input.purchaseId, companyId: user.companyId, deletedAt: null },
      });
      if (!purchase) {
        throw notFound('Purchase not found');
      }
      if (purchase.status !== 'RECEIVED' && purchase.status !== 'PARTIAL') {
        throw conflict('Only received purchases can be returned');
      }

      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          companyId: user.companyId,
          branchId: user.branchId,
          purchaseId: input.purchaseId,
          returnNumber: buildReturnNumber(input.returnNumber),
          status,
          subtotal: summary.subtotal,
          taxAmount: summary.taxAmount,
          totalAmount: summary.totalAmount,
          reason: input.reason,
          returnedAt: status === 'COMPLETED' ? new Date() : null,
          items: summary.items as Prisma.InputJsonValue,
          createdBy: user.id,
          updatedBy: user.id,
        },
        include: { purchase: true },
      });

      if (status === 'COMPLETED') {
        await this.applyReturnStock(tx, user, purchaseReturn.id, input.items);
        await tx.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            outstandingBalance: {
              decrement: toDecimal(summary.totalAmount),
            },
            updatedBy: user.id,
            version: { increment: 1 },
          },
        });
      }

      return purchaseReturn;
    });
  }

  async update(user: AuthUser, id: string, input: UpdatePurchaseReturnInput) {
    assertPermission(user, 'purchase.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw conflict(`Cannot update purchase return in status ${existing.status}`);
    }

    const summary = input.items ? summarizeItems(input.items) : null;
    const nextStatus = input.status ?? existing.status;

    const db = this.returns.getClient();
    return db.$transaction(async (tx) => {
      const purchaseReturn = await tx.purchaseReturn.update({
        where: { id },
        data: {
          ...(input.reason !== undefined ? { reason: input.reason } : {}),
          ...(summary
            ? {
                items: summary.items as Prisma.InputJsonValue,
                subtotal: summary.subtotal,
                taxAmount: summary.taxAmount,
                totalAmount: summary.totalAmount,
              }
            : {}),
          status: nextStatus,
          returnedAt: nextStatus === 'COMPLETED' ? new Date() : existing.returnedAt,
          updatedBy: user.id,
          version: { increment: 1 },
        },
        include: { purchase: true },
      });

      if (existing.status !== 'COMPLETED' && nextStatus === 'COMPLETED') {
        const items = (summary?.items ??
          (existing.items as PurchaseReturnItemInput[])) as PurchaseReturnItemInput[];
        await this.applyReturnStock(tx, user, purchaseReturn.id, items);
        await tx.supplier.update({
          where: { id: purchaseReturn.purchase.supplierId },
          data: {
            outstandingBalance: {
              decrement: toDecimal(purchaseReturn.totalAmount),
            },
            updatedBy: user.id,
            version: { increment: 1 },
          },
        });
      }

      return purchaseReturn;
    });
  }

  async complete(user: AuthUser, id: string) {
    return this.update(user, id, { status: 'COMPLETED' });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'purchase.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'COMPLETED') {
      throw conflict('Completed purchase returns cannot be deleted');
    }
    return this.returns.softDelete(id, user.id);
  }

  private async applyReturnStock(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    returnId: string,
    items: PurchaseReturnItemInput[],
  ): Promise<void> {
    for (const item of items) {
      await this.inventoryService.applyMovement(tx, user, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: -Math.abs(item.quantity),
        unitCost: item.unitPrice,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        movementType: 'PURCHASE_RETURN',
        referenceType: 'PURCHASE_RETURN',
        referenceId: returnId,
      });
    }
  }
}
