import { StockMovementService } from '../../src/services/StockMovementService';
import type { IStockMovementRepository } from '../../src/repositories/StockMovementRepository';
import type { InventoryService } from '../../src/services/InventoryService';
import type { AuthUser } from '../../src/types/auth';
import { AppError, conflict } from '../../src/errors/AppError';

describe('StockMovementService', () => {
  const user: AuthUser = {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    roles: ['STORE_ADMIN'],
    permissions: ['inventory.view', 'inventory.manage'],
  };

  const productId = '11111111-1111-4111-8111-111111111111';
  const referenceId = '22222222-2222-4222-8222-222222222222';

  function repoWithClient(): IStockMovementRepository {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      getClient: jest.fn().mockReturnValue({
        $transaction: (fn: (client: unknown) => Promise<unknown>) => fn({}),
      }),
    };
  }

  it('passes the caller-supplied movementType/referenceType/referenceId through to applyMovement (regression for the ADJUSTMENT-only bug)', async () => {
    const movements = repoWithClient();
    const inventoryService = {
      applyMovement: jest.fn().mockResolvedValue({ id: 'inv-1' }),
    } as unknown as InventoryService;

    const service = new StockMovementService(movements, inventoryService);

    await service.create(user, {
      productId,
      movementType: 'TRANSFER_IN',
      quantity: 5,
      referenceType: 'TRANSFER',
      referenceId,
    });

    expect(inventoryService.applyMovement).toHaveBeenCalledWith(
      {},
      user,
      expect.objectContaining({
        productId,
        quantity: 5,
        movementType: 'TRANSFER_IN',
        referenceType: 'TRANSFER',
        referenceId,
      }),
    );
  });

  it('propagates a CONFLICT thrown by applyMovement (optimistic concurrency) unchanged', async () => {
    const movements = repoWithClient();
    const inventoryService = {
      applyMovement: jest.fn().mockRejectedValue(conflict('Inventory was modified concurrently; retry the operation')),
    } as unknown as InventoryService;

    const service = new StockMovementService(movements, inventoryService);

    await expect(
      service.create(user, { productId, movementType: 'ADJUSTMENT', quantity: 5 }),
    ).rejects.toMatchObject({ code: 'CONFLICT' } satisfies Partial<AppError>);
  });

  it('rejects create without permission', async () => {
    const movements = repoWithClient();
    const inventoryService = { applyMovement: jest.fn() } as unknown as InventoryService;
    const service = new StockMovementService(movements, inventoryService);

    await expect(
      service.create(
        { ...user, permissions: [], roles: ['SALES_USER'] },
        { productId, movementType: 'ADJUSTMENT', quantity: 5 },
      ),
    ).rejects.toBeInstanceOf(AppError);
    expect(inventoryService.applyMovement).not.toHaveBeenCalled();
  });
});
