import type { HoldBill, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { HoldBillListQuery } from '../validators/holdBill.schemas';

const holdInclude = {
  sale: {
    include: {
      items: { where: { deletedAt: null } },
      customer: true,
    },
  },
  customer: true,
} satisfies Prisma.HoldBillInclude;

export type HoldBillWithRelations = Prisma.HoldBillGetPayload<{
  include: typeof holdInclude;
}>;

export interface IHoldBillRepository {
  create(data: Prisma.HoldBillCreateInput): Promise<HoldBillWithRelations>;
  findById(companyId: string, id: string): Promise<HoldBillWithRelations | null>;
  list(
    companyId: string,
    query: HoldBillListQuery,
  ): Promise<PaginatedResult<HoldBillWithRelations>>;
  softDelete(id: string, updatedBy: string): Promise<HoldBill>;
  getClient(): PrismaClient;
}

export class HoldBillRepository implements IHoldBillRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.HoldBillCreateInput): Promise<HoldBillWithRelations> {
    return this.db.holdBill.create({ data, include: holdInclude });
  }

  findById(companyId: string, id: string): Promise<HoldBillWithRelations | null> {
    return this.db.holdBill.findFirst({
      where: { id, companyId, deletedAt: null },
      include: holdInclude,
    });
  }

  async list(
    companyId: string,
    query: HoldBillListQuery,
  ): Promise<PaginatedResult<HoldBillWithRelations>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.HoldBillWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { holdNumber: { contains: query.search, mode: 'insensitive' } },
              { referenceNote: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.holdBill.count({ where }),
      this.db.holdBill.findMany({
        where,
        skip,
        take,
        include: holdInclude,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'heldAt',
          'createdAt',
          'updatedAt',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  softDelete(id: string, updatedBy: string): Promise<HoldBill> {
    return this.db.holdBill.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy,
        version: { increment: 1 },
      },
    });
  }
}
