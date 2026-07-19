import { Prisma } from '@prisma/client';
import { conflict, notFound } from '../errors/AppError';
import type { IPurchaseRepository } from '../repositories/PurchaseRepository';
import type { InventoryService } from './InventoryService';
import type { AuthUser } from '../types/auth';
import { calculateLineTotals, roundMoney, toDecimal } from '../utils/money';
import { assertPermission } from '../utils/permissions';
import type {
  CreatePurchaseInput,
  PurchaseItemInput,
  PurchaseListQuery,
  UpdatePurchaseInput,
} from '../validators/purchase.schemas';

function buildInvoiceNumber(input?: string): string {
  return input?.trim() || `PUR-${Date.now()}`;
}

function mapItems(items: PurchaseItemInput[], user: AuthUser) {
  return items.map((item) => {
    const totals = calculateLineTotals({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
    });
    return {
      companyId: user.companyId,
      branchId: user.branchId,
      productId: item.productId,
      variantId: item.variantId ?? null,
      unitId: item.unitId ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: totals.discountAmount,
      taxRate: item.taxRate ?? 0,
      taxAmount: totals.taxAmount,
      lineTotal: totals.lineTotal,
      batchNumber: item.batchNumber ?? null,
      serialNumber: item.serialNumber ?? null,
      expiryDate: item.expiryDate,
      createdBy: user.id,
      updatedBy: user.id,
    };
  });
}

function sumHeader(mapped: ReturnType<typeof mapItems>) {
  const subtotal = roundMoney(
    mapped.reduce(
      (sum, item) => sum.add(toDecimal(item.quantity).mul(item.unitPrice)),
      new Prisma.Decimal(0),
    ),
  );
  const discountAmount = roundMoney(
    mapped.reduce((sum, item) => sum.add(item.discountAmount), new Prisma.Decimal(0)),
  );
  const taxAmount = roundMoney(
    mapped.reduce((sum, item) => sum.add(item.taxAmount), new Prisma.Decimal(0)),
  );
  const totalAmount = roundMoney(
    mapped.reduce((sum, item) => sum.add(item.lineTotal), new Prisma.Decimal(0)),
  );
  return { subtotal, discountAmount, taxAmount, totalAmount };
}

export class PurchaseService {
  constructor(
    private readonly purchases: IPurchaseRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async list(user: AuthUser, query: PurchaseListQuery) {
    assertPermission(user, 'purchase.view');
    return this.purchases.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'purchase.view');
    const purchase = await this.purchases.findById(user.companyId, id);
    if (!purchase) {
      throw notFound('Purchase not found');
    }
    return purchase;
  }

  async create(user: AuthUser, input: CreatePurchaseInput) {
    assertPermission(user, 'purchase.manage');
    const mappedItems = mapItems(input.items, user);
    const header = sumHeader(mappedItems);
    const status = input.status ?? 'DRAFT';
    const paidAmount = roundMoney(input.paidAmount ?? 0);

    const db = this.purchases.getClient();
    return db.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          companyId: user.companyId,
          branchId: user.branchId,
          supplierId: input.supplierId,
          invoiceNumber: buildInvoiceNumber(input.invoiceNumber),
          invoiceDate: input.invoiceDate,
          status,
          subtotal: header.subtotal,
          discountAmount: header.discountAmount,
          taxAmount: header.taxAmount,
          totalAmount: header.totalAmount,
          paidAmount,
          notes: input.notes,
          receivedAt: status === 'RECEIVED' ? new Date() : null,
          createdBy: user.id,
          updatedBy: user.id,
          items: { create: mappedItems },
        },
        include: {
          items: { where: { deletedAt: null } },
          supplier: true,
          payments: { where: { deletedAt: null } },
        },
      });

      if (status === 'RECEIVED') {
        await this.receiveStock(tx, user, purchase.id, mappedItems);
        await this.updateSupplierBalance(
          tx,
          user,
          input.supplierId,
          header.totalAmount.sub(paidAmount),
        );
      }

      return purchase;
    });
  }

  async update(user: AuthUser, id: string, input: UpdatePurchaseInput) {
    assertPermission(user, 'purchase.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'RECEIVED' || existing.status === 'CANCELLED') {
      throw conflict(`Cannot update purchase in status ${existing.status}`);
    }

    const mappedItems = input.items ? mapItems(input.items, user) : null;
    const header = mappedItems ? sumHeader(mappedItems) : null;
    const nextStatus = input.status ?? existing.status;
    const paidAmount =
      input.paidAmount === undefined
        ? existing.paidAmount
        : roundMoney(input.paidAmount);

    const db = this.purchases.getClient();
    return db.$transaction(async (tx) => {
      if (mappedItems) {
        await tx.purchaseItem.updateMany({
          where: { purchaseId: id, deletedAt: null },
          data: { deletedAt: new Date(), updatedBy: user.id, version: { increment: 1 } },
        });
      }

      const purchase = await tx.purchase.update({
        where: { id },
        data: {
          ...(input.supplierId ? { supplierId: input.supplierId } : {}),
          ...(input.invoiceNumber ? { invoiceNumber: input.invoiceNumber } : {}),
          ...(input.invoiceDate ? { invoiceDate: input.invoiceDate } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          status: nextStatus,
          paidAmount,
          ...(header
            ? {
                subtotal: header.subtotal,
                discountAmount: header.discountAmount,
                taxAmount: header.taxAmount,
                totalAmount: header.totalAmount,
              }
            : {}),
          receivedAt: nextStatus === 'RECEIVED' ? new Date() : existing.receivedAt,
          updatedBy: user.id,
          version: { increment: 1 },
          ...(mappedItems ? { items: { create: mappedItems } } : {}),
        },
        include: {
          items: { where: { deletedAt: null } },
          supplier: true,
          payments: { where: { deletedAt: null } },
        },
      });

      if (existing.status !== 'RECEIVED' && nextStatus === 'RECEIVED') {
        const items = purchase.items.map((item) => ({
          companyId: user.companyId,
          branchId: user.branchId,
          productId: item.productId,
          variantId: item.variantId,
          unitId: item.unitId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountAmount: item.discountAmount,
          taxRate: Number(item.taxRate),
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber,
          expiryDate: item.expiryDate ?? undefined,
          createdBy: user.id,
          updatedBy: user.id,
        }));
        await this.receiveStock(tx, user, purchase.id, items);
        await this.updateSupplierBalance(
          tx,
          user,
          purchase.supplierId,
          toDecimal(purchase.totalAmount).sub(toDecimal(purchase.paidAmount)),
        );
      }

      return purchase;
    });
  }

  async receive(user: AuthUser, id: string) {
    return this.update(user, id, { status: 'RECEIVED' });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'purchase.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'RECEIVED') {
      throw conflict('Received purchases cannot be deleted');
    }
    return this.purchases.softDelete(id, user.id);
  }

  private async receiveStock(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    purchaseId: string,
    items: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number | Prisma.Decimal;
      unitPrice: number | Prisma.Decimal;
      batchNumber?: string | null;
      serialNumber?: string | null;
      expiryDate?: Date | null;
    }>,
  ): Promise<void> {
    for (const item of items) {
      await this.inventoryService.applyMovement(tx, user, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitPrice),
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        expiryDate: item.expiryDate ?? undefined,
        movementType: 'PURCHASE',
        referenceType: 'PURCHASE',
        referenceId: purchaseId,
      });
    }
  }

  private async updateSupplierBalance(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    supplierId: string,
    delta: Prisma.Decimal,
  ): Promise<void> {
    if (delta.eq(0)) {
      return;
    }
    await tx.supplier.update({
      where: { id: supplierId },
      data: {
        outstandingBalance: { increment: delta },
        updatedBy: user.id,
        version: { increment: 1 },
      },
    });
  }
}
