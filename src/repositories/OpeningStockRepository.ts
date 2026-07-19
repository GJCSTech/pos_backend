import type { OpeningStock, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { OpeningStockListQuery } from '../validators/openingStock.schemas';

export interface IOpeningStockRepository {
  create(data: Prisma.OpeningStockCreateInput): Promise<OpeningStock>;
  findById(companyId: string, id: string): Promise<OpeningStock | null>;
  list(companyId: string, query: OpeningStockListQuery): Promise<PaginatedResult<OpeningStock>>;
  markPosted(id: string, updatedBy: string): Promise<OpeningStock>;
  softDelete(id: string, updatedBy: string): Promise<OpeningStock>;
  getClient(): PrismaClient;
}

export class OpeningStockRepository implements IOpeningStockRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.OpeningStockCreateInput): Promise<OpeningStock> {
    return this.db.openingStock.create({ data });
  }

  findById(companyId: string, id: string): Promise<OpeningStock | null> {
    return this.db.openingStock.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { product: true, variant: true },
    });
  }

  async list(
    companyId: string,
    query: OpeningStockListQuery,
  ): Promise<PaginatedResult<OpeningStock>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.OpeningStockWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.isPosted === undefined ? {} : { isPosted: query.isPosted }),
    };

    const [total, items] = await this.db.$transaction([
      this.db.openingStock.count({ where }),
      this.db.openingStock.findMany({
        where,
        skip,
        take,
        include: { product: true, variant: true },
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'createdAt',
          'stockedAt',
          'updatedAt',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  markPosted(id: string, updatedBy: string): Promise<OpeningStock> {
    return this.db.openingStock.update({
      where: { id },
      data: { isPosted: true, updatedBy, version: { increment: 1 } },
    });
  }

  softDelete(id: string, updatedBy: string): Promise<OpeningStock> {
    return this.db.openingStock.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, version: { increment: 1 } },
    });
  }
}
