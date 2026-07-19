import type { Prisma, PrismaClient, ProductVariant } from '@prisma/client';

export interface IProductVariantRepository {
  findById(companyId: string, id: string): Promise<ProductVariant | null>;
  list(
    where: Prisma.ProductVariantWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ProductVariantOrderByWithRelationInput,
  ): Promise<[ProductVariant[], number]>;
  create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant>;
  update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant>;
  softDelete(id: string, userId: string): Promise<ProductVariant>;
}

export class ProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(companyId: string, id: string): Promise<ProductVariant | null> {
    return this.db.productVariant.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(
    where: Prisma.ProductVariantWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ProductVariantOrderByWithRelationInput,
  ): Promise<[ProductVariant[], number]> {
    const [items, total] = await this.db.$transaction([
      this.db.productVariant.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take,
        orderBy,
      }),
      this.db.productVariant.count({ where: { ...where, deletedAt: null } }),
    ]);
    return [items, total];
  }

  create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    return this.db.productVariant.create({ data });
  }

  update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    return this.db.productVariant.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  softDelete(id: string, userId: string): Promise<ProductVariant> {
    return this.db.productVariant.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId, version: { increment: 1 } },
    });
  }
}
