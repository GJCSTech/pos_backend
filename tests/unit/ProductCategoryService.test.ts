import { ProductCategoryService } from '../../src/services/ProductCategoryService';
import type { IProductCategoryRepository } from '../../src/repositories/ProductCategoryRepository';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('ProductCategoryService', () => {
  const user: AuthUser = {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    roles: ['STORE_ADMIN'],
    permissions: ['catalog.view', 'catalog.manage'],
  };

  it('creates a category scoped to the user company/branch', async () => {
    const repo: IProductCategoryRepository = {
      create: jest.fn().mockResolvedValue({ id: 'cat-1', name: 'Plants' }),
      update: jest.fn(),
      softDelete: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };

    const service = new ProductCategoryService(repo);
    const result = await service.create(user, {
      name: 'Plants',
      code: 'PLANTS',
      sortOrder: 1,
      isActive: true,
    });

    expect(result.id).toBe('cat-1');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Plants',
        code: 'PLANTS',
        createdBy: 'user-1',
        company: { connect: { id: 'company-1' } },
        branch: { connect: { id: 'branch-1' } },
      }),
    );
  });

  it('rejects create without permission', async () => {
    const repo: IProductCategoryRepository = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };

    const service = new ProductCategoryService(repo);
    await expect(
      service.create(
        { ...user, permissions: [], roles: ['SALES_USER'] },
        { name: 'Plants', code: 'PLANTS', sortOrder: 0, isActive: true },
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});
