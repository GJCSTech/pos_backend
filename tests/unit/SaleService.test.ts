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
});
