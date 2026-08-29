import { HoldBillService } from '../../src/services/HoldBillService';
import type { IHoldBillRepository } from '../../src/repositories/HoldBillRepository';
import type { SaleService } from '../../src/services/SaleService';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('HoldBillService', () => {
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
  const holdBillId = '22222222-2222-4222-8222-222222222222';
  const productId = '33333333-3333-4333-8333-333333333333';

  function repoWithTx(tx: Record<string, unknown>): IHoldBillRepository {
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

  it('create() with an inline sale payload calls saleService.create with the shared tx, then writes the hold bill via tx.holdBill.create', async () => {
    const tx = {
      holdBill: { create: jest.fn().mockResolvedValue({ id: holdBillId }) },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn().mockResolvedValue({ id: saleId, customerId: null }),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await service.create(user, {
      sale: {
        items: [{ productId, quantity: 1, unitPrice: 100 }],
      },
    });

    expect(saleService.create).toHaveBeenCalledWith(
      user,
      expect.objectContaining({ status: 'HELD' }),
      tx,
    );
    expect(tx.holdBill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: true }),
      }),
    );
    expect(holdBills.create).not.toHaveBeenCalled();
  });

  it('create() with an existing saleId reads the sale via tx.sale.findFirst (not saleService.getById) and calls saleService.update with the shared tx', async () => {
    const tx = {
      sale: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: saleId, status: 'DRAFT', customerId: null }),
      },
      holdBill: { create: jest.fn().mockResolvedValue({ id: holdBillId }) },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: saleId }),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await service.create(user, { saleId });

    expect(tx.sale.findFirst).toHaveBeenCalled();
    expect(saleService.getById).not.toHaveBeenCalled();
    expect(saleService.update).toHaveBeenCalledWith(
      user,
      saleId,
      expect.objectContaining({ status: 'HELD' }),
      tx,
    );
  });

  it('create() rejects holding a sale that is already COMPLETED or CANCELLED', async () => {
    const tx = {
      sale: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: saleId, status: 'COMPLETED', customerId: null }),
      },
      holdBill: { create: jest.fn() },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await expect(service.create(user, { saleId })).rejects.toMatchObject({
      code: 'CONFLICT',
    } satisfies Partial<AppError>);
    expect(tx.holdBill.create).not.toHaveBeenCalled();
  });

  it('resume() calls saleService.complete with the shared tx and closes the hold bill via tx.holdBill.update', async () => {
    const tx = {
      holdBill: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: holdBillId, saleId, isActive: true }),
        update: jest.fn().mockResolvedValue({ id: holdBillId, isActive: false }),
      },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn().mockResolvedValue({ id: saleId, status: 'COMPLETED' }),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    const payments = [{ method: 'CASH' as const, amount: 100 }];
    await service.resume(user, holdBillId, payments);

    expect(saleService.complete).toHaveBeenCalledWith(user, saleId, payments, tx);
    expect(tx.holdBill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: holdBillId },
        data: expect.objectContaining({ isActive: false }),
      }),
    );
    expect(holdBills.softDelete).not.toHaveBeenCalled();
  });

  it('resume() rejects an inactive hold bill', async () => {
    const tx = {
      holdBill: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: holdBillId, saleId, isActive: false }),
        update: jest.fn(),
      },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await expect(
      service.resume(user, holdBillId, [{ method: 'CASH', amount: 100 }]),
    ).rejects.toMatchObject({ code: 'CONFLICT' } satisfies Partial<AppError>);
    expect(saleService.complete).not.toHaveBeenCalled();
  });

  it('resume() requires at least one payment', async () => {
    const tx = { holdBill: { findFirst: jest.fn(), update: jest.fn() } };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await expect(service.resume(user, holdBillId, [])).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    } satisfies Partial<AppError>);
    expect(tx.holdBill.findFirst).not.toHaveBeenCalled();
  });

  it('cancel() calls saleService.remove with the shared tx and closes the hold bill via tx.holdBill.update', async () => {
    const tx = {
      holdBill: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: holdBillId, saleId, isActive: true }),
        update: jest.fn().mockResolvedValue({ id: holdBillId, isActive: false }),
      },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn().mockResolvedValue({ id: saleId, status: 'CANCELLED' }),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await service.cancel(user, holdBillId);

    expect(saleService.remove).toHaveBeenCalledWith(user, saleId, tx);
    expect(tx.holdBill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: holdBillId },
        data: expect.objectContaining({ isActive: false }),
      }),
    );
    expect(holdBills.softDelete).not.toHaveBeenCalled();
  });

  it('cancel() rejects an inactive hold bill', async () => {
    const tx = {
      holdBill: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: holdBillId, saleId, isActive: false }),
        update: jest.fn(),
      },
    };
    const holdBills = repoWithTx(tx);
    const saleService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    } as unknown as SaleService;

    const service = new HoldBillService(holdBills, saleService);

    await expect(service.cancel(user, holdBillId)).rejects.toMatchObject({
      code: 'CONFLICT',
    } satisfies Partial<AppError>);
    expect(saleService.remove).not.toHaveBeenCalled();
  });
});
