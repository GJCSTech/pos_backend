import type { Prisma, PrismaClient, Sale } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { SaleListQuery } from '../validators/sale.schemas';

const saleInclude = {
  items: { where: { deletedAt: null } },
  payments: { where: { deletedAt: null } },
  customer: true,
  holdBill: true,
} satisfies Prisma.SaleInclude;

export type SaleWithRelations = Prisma.SaleGetPayload<{ include: typeof saleInclude }>;

export interface ISaleRepository {
  create(data: Prisma.SaleCreateInput): Promise<SaleWithRelations>;
  update(id: string, data: Prisma.SaleUpdateInput): Promise<SaleWithRelations>;
  findById(companyId: string, id: string): Promise<SaleWithRelations | null>;
  list(companyId: string, query: SaleListQuery): Promise<PaginatedResult<SaleWithRelations>>;
  softDelete(id: string, updatedBy: string): Promise<Sale>;
  getClient(): PrismaClient;
}

export class SaleRepository implements ISaleRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.SaleCreateInput): Promise<SaleWithRelations> {
    return this.db.sale.create({ data, include: saleInclude });
  }

  update(id: string, data: Prisma.SaleUpdateInput): Promise<SaleWithRelations> {
    return this.db.sale.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
      include: saleInclude,
    });
  }

  findById(companyId: string, id: string): Promise<SaleWithRelations | null> {
    return this.db.sale.findFirst({
      where: { id, companyId, deletedAt: null },
      include: saleInclude,
    });
  }

  async list(
    companyId: string,
    query: SaleListQuery,
  ): Promise<PaginatedResult<SaleWithRelations>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.SaleWhereInput = {
      companyId,
      deletedAt: null,
      ...listDateFilters(query),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { billNumber: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.sale.count({ where }),
      this.db.sale.findMany({
        where,
        skip,
        take,
        include: saleInclude,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'createdAt',
          'totalAmount',
          'completedAt',
          'updatedAt',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  softDelete(id: string, updatedBy: string): Promise<Sale> {
    return this.db.sale.update({
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
