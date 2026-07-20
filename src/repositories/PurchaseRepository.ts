import type { Prisma, PrismaClient, Purchase } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { PurchaseListQuery } from '../validators/purchase.schemas';

const purchaseInclude = {
  items: { where: { deletedAt: null } },
  supplier: true,
  payments: { where: { deletedAt: null } },
} satisfies Prisma.PurchaseInclude;

export type PurchaseWithRelations = Prisma.PurchaseGetPayload<{
  include: typeof purchaseInclude;
}>;

export interface IPurchaseRepository {
  create(data: Prisma.PurchaseCreateInput): Promise<PurchaseWithRelations>;
  update(id: string, data: Prisma.PurchaseUpdateInput): Promise<PurchaseWithRelations>;
  findById(companyId: string, id: string): Promise<PurchaseWithRelations | null>;
  list(companyId: string, query: PurchaseListQuery): Promise<PaginatedResult<PurchaseWithRelations>>;
  softDelete(id: string, updatedBy: string): Promise<Purchase>;
  getClient(): PrismaClient;
}

export class PurchaseRepository implements IPurchaseRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.PurchaseCreateInput): Promise<PurchaseWithRelations> {
    return this.db.purchase.create({ data, include: purchaseInclude });
  }

  update(id: string, data: Prisma.PurchaseUpdateInput): Promise<PurchaseWithRelations> {
    return this.db.purchase.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
      include: purchaseInclude,
    });
  }

  findById(companyId: string, id: string): Promise<PurchaseWithRelations | null> {
    return this.db.purchase.findFirst({
      where: { id, companyId, deletedAt: null },
      include: purchaseInclude,
    });
  }

  async list(
    companyId: string,
    query: PurchaseListQuery,
  ): Promise<PaginatedResult<PurchaseWithRelations>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.PurchaseWhereInput = {
      companyId,
      deletedAt: null,
      ...listDateFilters(query),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.purchase.count({ where }),
      this.db.purchase.findMany({
        where,
        skip,
        take,
        include: purchaseInclude,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'createdAt',
          'invoiceDate',
          'totalAmount',
          'updatedAt',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  softDelete(id: string, updatedBy: string): Promise<Purchase> {
    return this.db.purchase.update({
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
