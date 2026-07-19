import type { CustomerGroup, Prisma, PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { CreateCustomerGroupInput, UpdateCustomerGroupInput, CustomerGroupListQuery } from '../validators/customerGroup.schemas';

export interface ICustomerGroupRepository {
  create(data: Prisma.CustomerGroupCreateInput): Promise<CustomerGroup>;
  update(id: string, data: Prisma.CustomerGroupUpdateInput): Promise<CustomerGroup>;
  softDelete(id: string, updatedBy: string): Promise<CustomerGroup>;
  findById(companyId: string, id: string): Promise<CustomerGroup | null>;
  list(companyId: string, query: CustomerGroupListQuery): Promise<PaginatedResult<CustomerGroup>>;
}

export class CustomerGroupRepository implements ICustomerGroupRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.CustomerGroupCreateInput): Promise<CustomerGroup> {
    return this.db.customerGroup.create({ data });
  }

  async update(id: string, data: Prisma.CustomerGroupUpdateInput): Promise<CustomerGroup> {
    return this.db.customerGroup.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<CustomerGroup> {
    return this.db.customerGroup.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<CustomerGroup | null> {
    return this.db.customerGroup.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: CustomerGroupListQuery): Promise<PaginatedResult<CustomerGroup>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.CustomerGroupWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.customerGroup.count({ where }),
      this.db.customerGroup.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","name","code","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateCustomerGroupInput, UpdateCustomerGroupInput };
