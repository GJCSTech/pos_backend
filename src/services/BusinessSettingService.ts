import type { BusinessSetting, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IBusinessSettingRepository } from '../repositories/BusinessSettingRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateBusinessSettingInput,
  UpdateBusinessSettingInput,
  BusinessSettingListQuery,
} from '../validators/businessSetting.schemas';

export class BusinessSettingService {
  constructor(private readonly repo: IBusinessSettingRepository) {}

  async create(user: AuthUser, input: CreateBusinessSettingInput): Promise<BusinessSetting> {
    assertPermission(user, 'settings.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.BusinessSettingCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateBusinessSettingInput): Promise<BusinessSetting> {
    assertPermission(user, 'settings.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('BusinessSetting not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.BusinessSettingUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<BusinessSetting> {
    assertPermission(user, 'settings.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('BusinessSetting not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<BusinessSetting> {
    assertPermission(user, 'settings.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('BusinessSetting not found');
    }
    return item;
  }

  async list(user: AuthUser, query: BusinessSettingListQuery): Promise<PaginatedResult<BusinessSetting>> {
    assertPermission(user, 'settings.view');
    return this.repo.list(user.companyId, query);
  }
}
