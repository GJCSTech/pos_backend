import type { ProductAttribute, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IProductAttributeRepository } from '../repositories/ProductAttributeRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateProductAttributeInput,
  UpdateProductAttributeInput,
  ProductAttributeListQuery,
} from '../validators/productAttribute.schemas';

export class ProductAttributeService {
  constructor(private readonly repo: IProductAttributeRepository) {}

  async create(user: AuthUser, input: CreateProductAttributeInput): Promise<ProductAttribute> {
    assertPermission(user, 'catalog.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.ProductAttributeCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateProductAttributeInput): Promise<ProductAttribute> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('ProductAttribute not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.ProductAttributeUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<ProductAttribute> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('ProductAttribute not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<ProductAttribute> {
    assertPermission(user, 'catalog.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('ProductAttribute not found');
    }
    return item;
  }

  async list(user: AuthUser, query: ProductAttributeListQuery): Promise<PaginatedResult<ProductAttribute>> {
    assertPermission(user, 'catalog.view');
    return this.repo.list(user.companyId, query);
  }
}
