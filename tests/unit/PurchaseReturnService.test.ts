import { Prisma } from '@prisma/client';
import { PurchaseReturnService } from '../../src/services/PurchaseReturnService';
import type { IPurchaseReturnRepository } from '../../src/repositories/PurchaseReturnRepository';
import type { InventoryService } from '../../src/services/InventoryService';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('PurchaseReturnService', () => {
  const user: AuthUser = {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    roles: ['STORE_ADMIN'],
    permissions: ['purchase.view', 'purchase.manage'],
  };

  const productId = '11111111-1111-4111-8111-111111111111';
  const purchaseId = '22222222-2222-4222-8222-222222222222';

  it('rejects completed return quantities above remaining returnable stock', async () => {
    const tx = {
      purchase: {
        findFirst: jest.fn().mockResolvedValue({
          id: purchaseId,
          supplierId: '33333333-3333-4333-8333-333333333333',
          status: 'RECEIVED',
        }),
      },
      purchaseReturn: {
        create: jest.fn().mockResolvedValue({
          id: '44444444-4444-4444-8444-444444444444',
          purchaseId,
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            items: [{ productId, quantity: 3, unitPrice: 10 }],
          },
        ]),
      },
      purchaseItem: {
        findMany: jest.fn().mockResolvedValue([
          {
            productId,
            variantId: null,
            quantity: new Prisma.Decimal(5),
          },
        ]),
      },
      supplier: { update: jest.fn() },
    };

    const returns: IPurchaseReturnRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      softDelete: jest.fn(),
      getClient: jest.fn().mockReturnValue({
        $transaction: (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
      }),
    };

    const inventoryService = {
      applyMovement: jest.fn(),
    } as unknown as InventoryService;

    const service = new PurchaseReturnService(returns, inventoryService);

    await expect(
      service.create(user, {
        purchaseId,
        status: 'COMPLETED',
        items: [{ productId, quantity: 3, unitPrice: 10 }],
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    } satisfies Partial<AppError>);

    expect(inventoryService.applyMovement).not.toHaveBeenCalled();
  });
});
