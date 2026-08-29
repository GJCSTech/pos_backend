import { Prisma } from '@prisma/client';
import { PaymentService } from '../../src/services/PaymentService';
import type { IPaymentRepository } from '../../src/repositories/PaymentRepository';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('PaymentService', () => {
  const user: AuthUser = {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    roles: ['STORE_ADMIN'],
    permissions: ['sales.view', 'sales.manage'],
  };

  const saleId = '11111111-1111-4111-8111-111111111111';
  const purchaseId = '22222222-2222-4222-8222-222222222222';
  const supplierId = '33333333-3333-4333-8333-333333333333';
  const paymentId = '44444444-4444-4444-8444-444444444444';

  function repoWithTx(tx: Record<string, unknown>): IPaymentRepository {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn().mockReturnValue({
        $transaction: (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
      }),
    };
  }

  it('rejects voiding without permission', async () => {
    const tx = { payment: { findFirst: jest.fn() } };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await expect(
      service.remove({ ...user, permissions: [], roles: ['SALES_USER'] }, paymentId),
    ).rejects.toBeInstanceOf(AppError);
    expect(tx.payment.findFirst).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the payment does not exist or is already deleted', async () => {
    const tx = { payment: { findFirst: jest.fn().mockResolvedValue(null) } };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await expect(service.remove(user, paymentId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('throws CONFLICT when voiding an already-voided payment', async () => {
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: paymentId,
          status: 'REFUNDED',
          deletedAt: null,
          targetType: 'SALE',
          saleId,
          amount: new Prisma.Decimal(50),
        }),
      },
    };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await expect(service.remove(user, paymentId)).rejects.toMatchObject({
      code: 'CONFLICT',
    } satisfies Partial<AppError>);
  });

  it('reverses a SALE payment: decrements sale.paidAmount and marks the payment REFUNDED', async () => {
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: paymentId,
          status: 'COMPLETED',
          deletedAt: null,
          targetType: 'SALE',
          saleId,
          purchaseId: null,
          amount: new Prisma.Decimal(50),
        }),
        update: jest.fn().mockResolvedValue({ id: paymentId, status: 'REFUNDED' }),
      },
      sale: {
        findFirst: jest.fn().mockResolvedValue({ id: saleId, paidAmount: new Prisma.Decimal(200) }),
        update: jest.fn(),
      },
    };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await service.remove(user, paymentId);

    const updateArg = (tx.sale.update as jest.Mock).mock.calls[0][0];
    expect(Number(updateArg.data.paidAmount)).toBe(150);
    expect(tx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: paymentId },
        data: expect.objectContaining({ status: 'REFUNDED' }),
      }),
    );
  });

  it('reverses a PURCHASE payment: decrements purchase.paidAmount and restores supplier.outstandingBalance', async () => {
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: paymentId,
          status: 'COMPLETED',
          deletedAt: null,
          targetType: 'PURCHASE',
          saleId: null,
          purchaseId,
          amount: new Prisma.Decimal(75),
        }),
        update: jest.fn().mockResolvedValue({ id: paymentId, status: 'REFUNDED' }),
      },
      purchase: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: purchaseId, supplierId, paidAmount: new Prisma.Decimal(300) }),
        update: jest.fn(),
      },
      supplier: { update: jest.fn() },
    };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await service.remove(user, paymentId);

    const purchaseUpdateArg = (tx.purchase.update as jest.Mock).mock.calls[0][0];
    expect(Number(purchaseUpdateArg.data.paidAmount)).toBe(225);
    const supplierUpdateArg = (tx.supplier.update as jest.Mock).mock.calls[0][0];
    expect(supplierUpdateArg.where).toEqual({ id: supplierId });
    expect(Number(supplierUpdateArg.data.outstandingBalance.increment)).toBe(75);
  });

  it('only reverses the amount of the specific payment row (split-payment correctness)', async () => {
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: paymentId,
          status: 'COMPLETED',
          deletedAt: null,
          targetType: 'SALE',
          saleId,
          purchaseId: null,
          amount: new Prisma.Decimal(30),
        }),
        update: jest.fn().mockResolvedValue({ id: paymentId, status: 'REFUNDED' }),
      },
      sale: {
        findFirst: jest.fn().mockResolvedValue({ id: saleId, paidAmount: new Prisma.Decimal(100) }),
        update: jest.fn(),
      },
    };
    const payments = repoWithTx(tx);
    const service = new PaymentService(payments);

    await service.remove(user, paymentId);

    const updateArg = (tx.sale.update as jest.Mock).mock.calls[0][0];
    // Only this payment's 30 is reversed, leaving the other sibling payments' contribution (70) intact.
    expect(Number(updateArg.data.paidAmount)).toBe(70);
  });
});
