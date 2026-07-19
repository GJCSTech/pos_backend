import type { ProductCategory, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IProductCategoryRepository } from '../repositories/ProductCategoryRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  ProductCategoryListQuery,
} from '../validators/productCategory.schemas';

export class ProductCategoryService {
  constructor(private readonly repo: IProductCategoryRepository) {}

  async create(user: AuthUser, input: CreateProductCategoryInput): Promise<ProductCategory> {
    assertPermission(user, 'catalog.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.ProductCategoryCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateProductCategoryInput): Promise<ProductCategory> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('ProductCategory not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.ProductCategoryUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<ProductCategory> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('ProductCategory not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<ProductCategory> {
    assertPermission(user, 'catalog.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('ProductCategory not found');
    }
    return item;
  }

  async list(user: AuthUser, query: ProductCategoryListQuery): Promise<PaginatedResult<ProductCategory>> {
    assertPermission(user, 'catalog.view');
    return this.repo.list(user.companyId, query);
  }
}
