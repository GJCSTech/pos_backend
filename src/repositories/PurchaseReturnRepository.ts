import type { Prisma, PrismaClient, PurchaseReturn } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { PurchaseReturnListQuery } from '../validators/purchaseReturn.schemas';

export interface IPurchaseReturnRepository {
  create(data: Prisma.PurchaseReturnCreateInput): Promise<PurchaseReturn>;
  update(id: string, data: Prisma.PurchaseReturnUpdateInput): Promise<PurchaseReturn>;
  findById(companyId: string, id: string): Promise<PurchaseReturn | null>;
  list(
    companyId: string,
    query: PurchaseReturnListQuery,
  ): Promise<PaginatedResult<PurchaseReturn>>;
  softDelete(id: string, updatedBy: string): Promise<PurchaseReturn>;
  getClient(): PrismaClient;
}

export class PurchaseReturnRepository implements IPurchaseReturnRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.PurchaseReturnCreateInput): Promise<PurchaseReturn> {
    return this.db.purchaseReturn.create({
      data,
      include: { purchase: true },
    });
  }

  update(id: string, data: Prisma.PurchaseReturnUpdateInput): Promise<PurchaseReturn> {
    return this.db.purchaseReturn.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
      include: { purchase: true },
    });
  }

  findById(companyId: string, id: string): Promise<PurchaseReturn | null> {
    return this.db.purchaseReturn.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { purchase: true },
    });
  }

  async list(
    companyId: string,
    query: PurchaseReturnListQuery,
  ): Promise<PaginatedResult<PurchaseReturn>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.PurchaseReturnWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.purchaseId ? { purchaseId: query.purchaseId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { returnNumber: { contains: query.search, mode: 'insensitive' } },
              { reason: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.purchaseReturn.count({ where }),
      this.db.purchaseReturn.findMany({
        where,
        skip,
        take,
        include: { purchase: true },
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'createdAt',
          'returnedAt',
          'totalAmount',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  softDelete(id: string, updatedBy: string): Promise<PurchaseReturn> {
    return this.db.purchaseReturn.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy,
        status: 'CANCELLED',
        version: { increment: 1 },
      },
    });
  }
}
