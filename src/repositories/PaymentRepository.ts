import type { Payment, Prisma, PrismaClient } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { PaymentListQuery } from '../validators/payment.schemas';

export interface IPaymentRepository {
  create(data: Prisma.PaymentCreateInput): Promise<Payment>;
  findById(companyId: string, id: string): Promise<Payment | null>;
  list(companyId: string, query: PaymentListQuery): Promise<PaginatedResult<Payment>>;
  softDelete(id: string, updatedBy: string): Promise<Payment>;
  getClient(): PrismaClient;
}

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.db.payment.create({
      data,
      include: { sale: true, purchase: true },
    });
  }

  findById(companyId: string, id: string): Promise<Payment | null> {
    return this.db.payment.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { sale: true, purchase: true },
    });
  }

  async list(
    companyId: string,
    query: PaymentListQuery,
  ): Promise<PaginatedResult<Payment>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.PaymentWhereInput = {
      companyId,
      deletedAt: null,
      ...listDateFilters(query),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.saleId ? { saleId: query.saleId } : {}),
      ...(query.purchaseId ? { purchaseId: query.purchaseId } : {}),
      ...(query.method ? { method: query.method } : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.payment.count({ where }),
      this.db.payment.findMany({
        where,
        skip,
        take,
        include: { sale: true, purchase: true },
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'paidAt',
          'createdAt',
          'amount',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  softDelete(id: string, updatedBy: string): Promise<Payment> {
    return this.db.payment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'REFUNDED',
        updatedBy,
        version: { increment: 1 },
      },
    });
  }
}
