import type { Prisma, PrismaClient, StockMovement } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { StockMovementListQuery } from '../validators/stockMovement.schemas';

export interface IStockMovementRepository {
  create(data: Prisma.StockMovementCreateInput): Promise<StockMovement>;
  findById(companyId: string, id: string): Promise<StockMovement | null>;
  list(companyId: string, query: StockMovementListQuery): Promise<PaginatedResult<StockMovement>>;
}

export class StockMovementRepository implements IStockMovementRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: Prisma.StockMovementCreateInput): Promise<StockMovement> {
    return this.db.stockMovement.create({ data });
  }

  findById(companyId: string, id: string): Promise<StockMovement | null> {
    return this.db.stockMovement.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { product: true, variant: true },
    });
  }

  async list(
    companyId: string,
    query: StockMovementListQuery,
  ): Promise<PaginatedResult<StockMovement>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.StockMovementWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.movementType ? { movementType: query.movementType } : {}),
      ...(query.referenceId ? { referenceId: query.referenceId } : {}),
      ...(query.search
        ? {
            OR: [
              { notes: { contains: query.search, mode: 'insensitive' } },
              { batchNumber: { contains: query.search, mode: 'insensitive' } },
              { serialNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.stockMovement.count({ where }),
      this.db.stockMovement.findMany({
        where,
        skip,
        take,
        include: { product: true, variant: true },
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'occurredAt',
          'createdAt',
          'quantity',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}
