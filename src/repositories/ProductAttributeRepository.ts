import type { ProductAttribute, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { CreateProductAttributeInput, UpdateProductAttributeInput, ProductAttributeListQuery } from '../validators/productAttribute.schemas';

export interface IProductAttributeRepository {
  create(data: Prisma.ProductAttributeCreateInput): Promise<ProductAttribute>;
  update(id: string, data: Prisma.ProductAttributeUpdateInput): Promise<ProductAttribute>;
  softDelete(id: string, updatedBy: string): Promise<ProductAttribute>;
  findById(companyId: string, id: string): Promise<ProductAttribute | null>;
  list(companyId: string, query: ProductAttributeListQuery): Promise<PaginatedResult<ProductAttribute>>;
}

export class ProductAttributeRepository implements IProductAttributeRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.ProductAttributeCreateInput): Promise<ProductAttribute> {
    return this.db.productAttribute.create({ data });
  }

  async update(id: string, data: Prisma.ProductAttributeUpdateInput): Promise<ProductAttribute> {
    return this.db.productAttribute.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<ProductAttribute> {
    return this.db.productAttribute.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<ProductAttribute | null> {
    return this.db.productAttribute.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: ProductAttributeListQuery): Promise<PaginatedResult<ProductAttribute>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.ProductAttributeWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.productAttribute.count({ where }),
      this.db.productAttribute.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateProductAttributeInput, UpdateProductAttributeInput };
