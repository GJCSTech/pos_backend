import type { ProductCategory, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { CreateProductCategoryInput, UpdateProductCategoryInput, ProductCategoryListQuery } from '../validators/productCategory.schemas';

export interface IProductCategoryRepository {
  create(data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory>;
  update(id: string, data: Prisma.ProductCategoryUpdateInput): Promise<ProductCategory>;
  softDelete(id: string, updatedBy: string): Promise<ProductCategory>;
  findById(companyId: string, id: string): Promise<ProductCategory | null>;
  list(companyId: string, query: ProductCategoryListQuery): Promise<PaginatedResult<ProductCategory>>;
}

export class ProductCategoryRepository implements IProductCategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory> {
    return this.db.productCategory.create({ data });
  }

  async update(id: string, data: Prisma.ProductCategoryUpdateInput): Promise<ProductCategory> {
    return this.db.productCategory.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<ProductCategory> {
    return this.db.productCategory.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<ProductCategory | null> {
    return this.db.productCategory.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: ProductCategoryListQuery): Promise<PaginatedResult<ProductCategory>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.ProductCategoryWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.productCategory.count({ where }),
      this.db.productCategory.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","sortOrder","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateProductCategoryInput, UpdateProductCategoryInput };
