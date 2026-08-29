import { SaleService } from '../../src/services/SaleService';
import type { ISaleRepository } from '../../src/repositories/SaleRepository';
import type { InventoryService } from '../../src/services/InventoryService';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('SaleService', () => {
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

  it('requires payments when completing a sale on create', async () => {
    const sales: ISaleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn(),
    };
    const inventoryService = {
      applyMovement: jest.fn(),
    } as unknown as InventoryService;

    const service = new SaleService(sales, inventoryService);
    await expect(
      service.create(user, {
        status: 'COMPLETED',
        items: [
          {
            productId: '11111111-1111-4111-8111-111111111111',
            quantity: 1,
            unitPrice: 100,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects create without permission', async () => {
    const sales: ISaleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn(),
    };
    const inventoryService = {
      applyMovement: jest.fn(),
    } as unknown as InventoryService;

    const service = new SaleService(sales, inventoryService);
    await expect(
      service.create(
        { ...user, permissions: [], roles: ['SALES_USER'] },
        {
          items: [
            {
              productId: '11111111-1111-4111-8111-111111111111',
              quantity: 1,
              unitPrice: 100,
            },
          ],
        },
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('create() runs directly against a supplied externalTx without opening its own transaction', async () => {
    const tx = {
      sale: {
        create: jest.fn().mockResolvedValue({
          id: 'sale-1',
          customerId: null,
          items: [],
        }),
      },
    };
    const sales: ISaleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn(),
    };
    const inventoryService = {
      applyMovement: jest.fn(),
    } as unknown as InventoryService;

    const service = new SaleService(sales, inventoryService);
    await service.create(
      user,
      {
        items: [
          {
            productId: '11111111-1111-4111-8111-111111111111',
            quantity: 1,
            unitPrice: 100,
          },
        ],
      },
      tx as unknown as Parameters<SaleService['create']>[2],
    );

    expect(tx.sale.create).toHaveBeenCalled();
    expect(sales.getClient).not.toHaveBeenCalled();
  });

  it('remove() runs directly against a supplied externalTx without touching the repository', async () => {
    const tx = {
      sale: {
        findFirst: jest.fn().mockResolvedValue({ id: 'sale-1', status: 'DRAFT' }),
        update: jest.fn().mockResolvedValue({ id: 'sale-1', status: 'CANCELLED' }),
      },
    };
    const sales: ISaleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn(),
    };
    const inventoryService = { applyMovement: jest.fn() } as unknown as InventoryService;

    const service = new SaleService(sales, inventoryService);
    await service.remove(user, 'sale-1', tx as unknown as Parameters<SaleService['remove']>[2]);

    expect(tx.sale.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sale-1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
    expect(sales.softDelete).not.toHaveBeenCalled();
    expect(sales.getClient).not.toHaveBeenCalled();
  });

  it('remove() without externalTx preserves current behavior (uses the repository softDelete)', async () => {
    const sales: ISaleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 'sale-1', status: 'DRAFT' }),
      list: jest.fn(),
      softDelete: jest.fn().mockResolvedValue({ id: 'sale-1', status: 'CANCELLED' }),
      getClient: jest.fn(),
    };
    const inventoryService = { applyMovement: jest.fn() } as unknown as InventoryService;

    const service = new SaleService(sales, inventoryService);
    await service.remove(user, 'sale-1');

    expect(sales.softDelete).toHaveBeenCalledWith('sale-1', user.id);
  });
});
