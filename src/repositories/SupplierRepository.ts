import type { Supplier, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { CreateSupplierInput, UpdateSupplierInput, SupplierListQuery } from '../validators/supplier.schemas';

export interface ISupplierRepository {
  create(data: Prisma.SupplierCreateInput): Promise<Supplier>;
  update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier>;
  softDelete(id: string, updatedBy: string): Promise<Supplier>;
  findById(companyId: string, id: string): Promise<Supplier | null>;
  list(companyId: string, query: SupplierListQuery): Promise<PaginatedResult<Supplier>>;
}

export class SupplierRepository implements ISupplierRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.db.supplier.create({ data });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return this.db.supplier.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<Supplier> {
    return this.db.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<Supplier | null> {
    return this.db.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: SupplierListQuery): Promise<PaginatedResult<Supplier>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.SupplierWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { gstin: { contains: search, mode: 'insensitive' as const } },
              { pan: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.supplier.count({ where }),
      this.db.supplier.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateSupplierInput, UpdateSupplierInput };
