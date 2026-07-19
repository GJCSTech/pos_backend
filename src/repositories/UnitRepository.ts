import type { Unit, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { CreateUnitInput, UpdateUnitInput, UnitListQuery } from '../validators/unit.schemas';

export interface IUnitRepository {
  create(data: Prisma.UnitCreateInput): Promise<Unit>;
  update(id: string, data: Prisma.UnitUpdateInput): Promise<Unit>;
  softDelete(id: string, updatedBy: string): Promise<Unit>;
  findById(companyId: string, id: string): Promise<Unit | null>;
  list(companyId: string, query: UnitListQuery): Promise<PaginatedResult<Unit>>;
}

export class UnitRepository implements IUnitRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.UnitCreateInput): Promise<Unit> {
    return this.db.unit.create({ data });
  }

  async update(id: string, data: Prisma.UnitUpdateInput): Promise<Unit> {
    return this.db.unit.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<Unit> {
    return this.db.unit.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<Unit | null> {
    return this.db.unit.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: UnitListQuery): Promise<PaginatedResult<Unit>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.UnitWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { symbol: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.unit.count({ where }),
      this.db.unit.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateUnitInput, UpdateUnitInput };
