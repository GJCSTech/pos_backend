import type { TaxMaster, Prisma, PrismaClient } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { CreateTaxMasterInput, UpdateTaxMasterInput, TaxMasterListQuery } from '../validators/taxMaster.schemas';

export interface ITaxMasterRepository {
  create(data: Prisma.TaxMasterCreateInput): Promise<TaxMaster>;
  update(id: string, data: Prisma.TaxMasterUpdateInput): Promise<TaxMaster>;
  softDelete(id: string, updatedBy: string): Promise<TaxMaster>;
  findById(companyId: string, id: string): Promise<TaxMaster | null>;
  list(companyId: string, query: TaxMasterListQuery): Promise<PaginatedResult<TaxMaster>>;
}

export class TaxMasterRepository implements ITaxMasterRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.TaxMasterCreateInput): Promise<TaxMaster> {
    return this.db.taxMaster.create({ data });
  }

  async update(id: string, data: Prisma.TaxMasterUpdateInput): Promise<TaxMaster> {
    return this.db.taxMaster.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<TaxMaster> {
    return this.db.taxMaster.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<TaxMaster | null> {
    return this.db.taxMaster.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: TaxMasterListQuery): Promise<PaginatedResult<TaxMaster>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.TaxMasterWhereInput = {
      companyId,
      deletedAt: null,
      ...listDateFilters(query),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { hsnSac: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.taxMaster.count({ where }),
      this.db.taxMaster.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","rate","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateTaxMasterInput, UpdateTaxMasterInput };
