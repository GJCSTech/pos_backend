import type { Prisma, PrismaClient, Product } from '@prisma/client';
export interface IProductRepository { findById(companyId: string, id: string): Promise<Product | null>; list(where: Prisma.ProductWhereInput, skip: number, take: number, orderBy: Prisma.ProductOrderByWithRelationInput): Promise<[Product[], number]>; create(data: Prisma.ProductCreateInput): Promise<Product>; update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>; softDelete(id: string, updatedBy: string): Promise<Product>; }
export class ProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}
  findById(companyId: string, id: string) { return this.db.product.findFirst({ where: { id, companyId, deletedAt: null }, include: { productUnits: { where: { deletedAt: null } }, variants: { where: { deletedAt: null } } } }); }
  async list(where: Prisma.ProductWhereInput, skip: number, take: number, orderBy: Prisma.ProductOrderByWithRelationInput) { const [items, total] = await this.db.$transaction([this.db.product.findMany({ where: { ...where, deletedAt: null }, skip, take, orderBy, include: { productUnits: { where: { deletedAt: null } } } }), this.db.product.count({ where: { ...where, deletedAt: null } })]); return [items, total] as [Product[], number]; }
  create(data: Prisma.ProductCreateInput) { return this.db.product.create({ data, include: { productUnits: true } }); }
  update(id: string, data: Prisma.ProductUpdateInput) { return this.db.product.update({ where: { id }, data: { ...data, version: { increment: 1 } }, include: { productUnits: { where: { deletedAt: null } } } }); }
  softDelete(id: string, updatedBy: string) { return this.db.product.update({ where: { id }, data: { deletedAt: new Date(), updatedBy, version: { increment: 1 } } }); }
}
