import { notFound, validationError } from '../errors/AppError';
import type { IPaymentRepository } from '../repositories/PaymentRepository';
import type { AuthUser } from '../types/auth';
import { roundMoney, toDecimal } from '../utils/money';
import { assertPermission } from '../utils/permissions';
import type { CreatePaymentInput, PaymentListQuery } from '../validators/payment.schemas';

export class PaymentService {
  constructor(private readonly payments: IPaymentRepository) {}

  async list(user: AuthUser, query: PaymentListQuery) {
    assertPermission(user, 'sales.view');
    return this.payments.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'sales.view');
    const payment = await this.payments.findById(user.companyId, id);
    if (!payment) {
      throw notFound('Payment not found');
    }
    return payment;
  }

  async create(user: AuthUser, input: CreatePaymentInput) {
    assertPermission(user, 'sales.manage');
    const db = this.payments.getClient();

    return db.$transaction(async (tx) => {
      if (input.targetType === 'SALE') {
        if (!input.saleId) {
          throw validationError('saleId is required for SALE payments');
        }
        const sale = await tx.sale.findFirst({
          where: { id: input.saleId, companyId: user.companyId, deletedAt: null },
        });
        if (!sale) {
          throw notFound('Sale not found');
        }

        const payment = await tx.payment.create({
          data: {
            companyId: user.companyId,
            branchId: user.branchId,
            targetType: 'SALE',
            saleId: input.saleId,
            method: input.method,
            status: input.status ?? 'COMPLETED',
            amount: input.amount,
            referenceNo: input.referenceNo,
            paidAt: input.paidAt ?? new Date(),
            notes: input.notes,
            createdBy: user.id,
            updatedBy: user.id,
          },
          include: { sale: true, purchase: true },
        });

        const nextPaid = roundMoney(toDecimal(sale.paidAmount).add(input.amount));
        await tx.sale.update({
          where: { id: sale.id },
          data: {
            paidAmount: nextPaid,
            updatedBy: user.id,
            version: { increment: 1 },
          },
        });

        return payment;
      }

      if (!input.purchaseId) {
        throw validationError('purchaseId is required for PURCHASE payments');
      }
      const purchase = await tx.purchase.findFirst({
        where: { id: input.purchaseId, companyId: user.companyId, deletedAt: null },
      });
      if (!purchase) {
        throw notFound('Purchase not found');
      }

      const payment = await tx.payment.create({
        data: {
          companyId: user.companyId,
          branchId: user.branchId,
          targetType: 'PURCHASE',
          purchaseId: input.purchaseId,
          method: input.method,
          status: input.status ?? 'COMPLETED',
          amount: input.amount,
          referenceNo: input.referenceNo,
          paidAt: input.paidAt ?? new Date(),
          notes: input.notes,
          createdBy: user.id,
          updatedBy: user.id,
        },
        include: { sale: true, purchase: true },
      });

      const nextPaid = roundMoney(toDecimal(purchase.paidAmount).add(input.amount));
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          paidAmount: nextPaid,
          updatedBy: user.id,
          version: { increment: 1 },
        },
      });

      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          outstandingBalance: { decrement: input.amount },
          updatedBy: user.id,
          version: { increment: 1 },
        },
      });

      return payment;
    });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'sales.manage');
    const existing = await this.getById(user, id);
    return this.payments.softDelete(existing.id, user.id);
  }
}
