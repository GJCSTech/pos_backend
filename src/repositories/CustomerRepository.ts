import type { Customer, Prisma, PrismaClient } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerListQuery } from '../validators/customer.schemas';

export interface ICustomerRepository {
  create(data: Prisma.CustomerCreateInput): Promise<Customer>;
  update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer>;
  softDelete(id: string, updatedBy: string): Promise<Customer>;
  findById(companyId: string, id: string): Promise<Customer | null>;
  list(companyId: string, query: CustomerListQuery): Promise<PaginatedResult<Customer>>;
}

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.db.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return this.db.customer.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<Customer> {
    return this.db.customer.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<Customer | null> {
    return this.db.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: CustomerListQuery): Promise<PaginatedResult<Customer>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.CustomerWhereInput = {
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
              { phone: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { gstin: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.customer.count({ where }),
      this.db.customer.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateCustomerInput, UpdateCustomerInput };
