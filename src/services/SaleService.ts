import { Prisma } from '@prisma/client';
import { conflict, notFound, validationError } from '../errors/AppError';
import type { ISaleRepository } from '../repositories/SaleRepository';
import type { InventoryService } from './InventoryService';
import type { AuthUser } from '../types/auth';
import { calculateLineTotals, roundMoney, toDecimal } from '../utils/money';
import { assertPermission } from '../utils/permissions';
import type {
  CreateSaleInput,
  SaleItemInput,
  SaleListQuery,
  SalePaymentInput,
  UpdateSaleInput,
} from '../validators/sale.schemas';

function buildBillNumber(input?: string): string {
  return input?.trim() || `SAL-${Date.now()}`;
}

function mapItems(items: SaleItemInput[], user: AuthUser) {
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

export class SaleService {
  constructor(
    private readonly sales: ISaleRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async list(user: AuthUser, query: SaleListQuery) {
    assertPermission(user, 'sales.view');
    return this.sales.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'sales.view');
    const sale = await this.sales.findById(user.companyId, id);
    if (!sale) {
      throw notFound('Sale not found');
    }
    return sale;
  }

  async create(user: AuthUser, input: CreateSaleInput) {
    assertPermission(user, 'sales.manage');
    const mappedItems = mapItems(input.items, user);
    const header = sumHeader(mappedItems);
    const status = input.status ?? (input.payments?.length ? 'COMPLETED' : 'DRAFT');
    const payments = input.payments ?? [];
    const paidAmount = roundMoney(
      payments.reduce((sum, payment) => sum.add(payment.amount), new Prisma.Decimal(0)),
    );

    if (status === 'COMPLETED' && payments.length === 0) {
      throw validationError('Completed sales require at least one payment');
    }
    if (status === 'COMPLETED' && paidAmount.lt(header.totalAmount)) {
      throw validationError('Paid amount is less than sale total');
    }

    const db = this.sales.getClient();
    return db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          companyId: user.companyId,
          branchId: user.branchId,
          customerId: input.customerId ?? null,
          billNumber: buildBillNumber(input.billNumber),
          status,
          subtotal: header.subtotal,
          discountAmount: header.discountAmount,
          taxAmount: header.taxAmount,
          totalAmount: header.totalAmount,
          paidAmount,
          notes: input.notes,
          heldAt: status === 'HELD' ? new Date() : null,
          completedAt: status === 'COMPLETED' ? new Date() : null,
          createdBy: user.id,
          updatedBy: user.id,
          items: {
            create: mappedItems,
          },
          ...(payments.length
            ? {
                payments: {
                  create: payments.map((payment) =>
                    this.toPaymentCreate(user, payment, 'SALE'),
                  ),
                },
              }
            : {}),
        },
        include: {
          items: { where: { deletedAt: null } },
          payments: { where: { deletedAt: null } },
          customer: true,
          holdBill: true,
        },
      });

      if (status === 'COMPLETED') {
        await this.deductStock(tx, user, sale.id, input.items);
      }

      return sale;
    });
  }

  async update(user: AuthUser, id: string, input: UpdateSaleInput) {
    assertPermission(user, 'sales.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw conflict(`Cannot update sale in status ${existing.status}`);
    }

    const mappedItems = input.items ? mapItems(input.items, user) : null;
    const header = mappedItems ? sumHeader(mappedItems) : null;
    const nextStatus = input.status ?? existing.status;
    const payments = input.payments;
    const paidAmount = payments
      ? roundMoney(
          payments.reduce((sum, payment) => sum.add(payment.amount), new Prisma.Decimal(0)),
        )
      : existing.paidAmount;

    if (nextStatus === 'COMPLETED') {
      const total = header?.totalAmount ?? existing.totalAmount;
      if (!payments?.length && Number(existing.paidAmount) <= 0) {
        throw validationError('Completed sales require at least one payment');
      }
      if (toDecimal(paidAmount).lt(toDecimal(total))) {
        throw validationError('Paid amount is less than sale total');
      }
    }

    const db = this.sales.getClient();
    return db.$transaction(async (tx) => {
      if (mappedItems) {
        await tx.saleItem.updateMany({
          where: { saleId: id, deletedAt: null },
          data: { deletedAt: new Date(), updatedBy: user.id, version: { increment: 1 } },
        });
      }

      if (payments) {
        await tx.payment.updateMany({
          where: { saleId: id, deletedAt: null },
          data: { deletedAt: new Date(), updatedBy: user.id, version: { increment: 1 } },
        });
      }

      const sale = await tx.sale.update({
        where: { id },
        data: {
          ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.billNumber ? { billNumber: input.billNumber } : {}),
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
          heldAt: nextStatus === 'HELD' ? new Date() : existing.heldAt,
          completedAt: nextStatus === 'COMPLETED' ? new Date() : existing.completedAt,
          updatedBy: user.id,
          version: { increment: 1 },
          ...(mappedItems
            ? {
                items: {
                  create: mappedItems,
                },
              }
            : {}),
          ...(payments
            ? {
                payments: {
                  create: payments.map((payment) =>
                    this.toPaymentCreate(user, payment, 'SALE'),
                  ),
                },
              }
            : {}),
        },
        include: {
          items: { where: { deletedAt: null } },
          payments: { where: { deletedAt: null } },
          customer: true,
          holdBill: true,
        },
      });

      if (existing.status !== 'COMPLETED' && nextStatus === 'COMPLETED') {
        const sourceItems =
          input.items ??
          sale.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          }));
        await this.deductStock(tx, user, sale.id, sourceItems);
      }

      return sale;
    });
  }

  async complete(user: AuthUser, id: string, payments?: SalePaymentInput[]) {
    return this.update(user, id, {
      status: 'COMPLETED',
      ...(payments ? { payments } : {}),
    });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'sales.manage');
    const existing = await this.getById(user, id);
    if (existing.status === 'COMPLETED') {
      throw conflict('Completed sales cannot be deleted');
    }
    return this.sales.softDelete(id, user.id);
  }

  private toPaymentCreate(
    user: AuthUser,
    payment: SalePaymentInput,
    targetType: 'SALE',
  ): Prisma.PaymentCreateWithoutSaleInput {
    return {
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: user.branchId } },
      targetType,
      method: payment.method,
      status: 'COMPLETED',
      amount: payment.amount,
      referenceNo: payment.referenceNo,
      notes: payment.notes,
      paidAt: new Date(),
      createdBy: user.id,
      updatedBy: user.id,
    };
  }

  private async deductStock(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    saleId: string,
    items: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
      unitPrice: number;
      batchNumber?: string | null;
      serialNumber?: string | null;
    }>,
  ): Promise<void> {
    for (const item of items) {
      await this.inventoryService.applyMovement(tx, user, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: -Math.abs(item.quantity),
        unitCost: item.unitPrice,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        movementType: 'SALE',
        referenceType: 'SALE',
        referenceId: saleId,
      });
    }
  }
}
