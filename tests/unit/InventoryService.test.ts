import { Prisma } from '@prisma/client';
import { InventoryService } from '../../src/services/InventoryService';
import type { IInventoryRepository } from '../../src/repositories/InventoryRepository';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('InventoryService', () => {
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

  it('returns inventory valuation', async () => {
    const repo: IInventoryRepository = {
      findById: jest.fn(),
      list: jest.fn(),
      listLowStock: jest.fn(),
      sumInventoryValue: jest.fn().mockResolvedValue(new Prisma.Decimal(1500)),
      getClient: jest.fn(),
    };

    const service = new InventoryService(repo);
    const result = await service.getInventoryValue(user);

    expect(result.inventoryValue.toString()).toBe('1500');
    expect(repo.sumInventoryValue).toHaveBeenCalledWith('company-1', 'branch-1');
  });

  it('rejects valuation without permission', async () => {
    const repo: IInventoryRepository = {
      findById: jest.fn(),
      list: jest.fn(),
      listLowStock: jest.fn(),
      sumInventoryValue: jest.fn(),
      getClient: jest.fn(),
    };

    const service = new InventoryService(repo);
    await expect(
      service.getInventoryValue({ ...user, permissions: [], roles: ['SALES_USER'] }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
