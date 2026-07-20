import type { BusinessSetting, Prisma, PrismaClient } from '@prisma/client';
import {
  listDateFilters,
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult
} from '../utils/pagination';
import type { CreateBusinessSettingInput, UpdateBusinessSettingInput, BusinessSettingListQuery } from '../validators/businessSetting.schemas';

export interface IBusinessSettingRepository {
  create(data: Prisma.BusinessSettingCreateInput): Promise<BusinessSetting>;
  update(id: string, data: Prisma.BusinessSettingUpdateInput): Promise<BusinessSetting>;
  softDelete(id: string, updatedBy: string): Promise<BusinessSetting>;
  findById(companyId: string, id: string): Promise<BusinessSetting | null>;
  list(companyId: string, query: BusinessSettingListQuery): Promise<PaginatedResult<BusinessSetting>>;
}

export class BusinessSettingRepository implements IBusinessSettingRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.BusinessSettingCreateInput): Promise<BusinessSetting> {
    return this.db.businessSetting.create({ data });
  }

  async update(id: string, data: Prisma.BusinessSettingUpdateInput): Promise<BusinessSetting> {
    return this.db.businessSetting.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: string, updatedBy: string): Promise<BusinessSetting> {
    return this.db.businessSetting.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy, isActive: false, version: { increment: 1 } },
    });
  }

  async findById(companyId: string, id: string): Promise<BusinessSetting | null> {
    return this.db.businessSetting.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async list(companyId: string, query: BusinessSettingListQuery): Promise<PaginatedResult<BusinessSetting>> {
    const { skip, take } = toSkipTake(query);
    const search = query.search?.trim();
    const where: Prisma.BusinessSettingWhereInput = {
      companyId,
      deletedAt: null,
      ...listDateFilters(query),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { key: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.businessSetting.count({ where }),
      this.db.businessSetting.findMany({
        where,
        skip,
        take,
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, ["createdAt","key","updatedAt"]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }
}

export type { CreateBusinessSettingInput, UpdateBusinessSettingInput };
