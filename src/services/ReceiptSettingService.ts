import type { Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IReceiptSettingRepository } from '../repositories/ReceiptSettingRepository';
import type { AuthUser } from '../types/auth';
import { assertPermission } from '../utils/permissions';
import type { UpsertReceiptSettingInput } from '../validators/receiptSetting.schemas';

export class ReceiptSettingService {
  constructor(private readonly settings: IReceiptSettingRepository) {}

  async get(user: AuthUser, branchId?: string) {
    assertPermission(user, 'settings.view');
    const targetBranchId = branchId ?? user.branchId;
    const setting = await this.settings.findByBranch(user.companyId, targetBranchId);
    if (!setting) {
      throw notFound('Receipt settings not found');
    }
    return setting;
  }

  async upsert(user: AuthUser, input: UpsertReceiptSettingInput) {
    assertPermission(user, 'settings.manage');
    const branchId = input.branchId ?? user.branchId;
    const { branchId: _ignored, extraSettings, ...rest } = input;

    return this.settings.upsert(user.companyId, branchId, {
      companyId: user.companyId,
      branchId,
      ...rest,
      ...(extraSettings === undefined
        ? {}
        : { extraSettings: extraSettings as Prisma.InputJsonValue }),
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  async remove(user: AuthUser, branchId?: string) {
    assertPermission(user, 'settings.manage');
    const existing = await this.get(user, branchId);
    return this.settings.softDelete(existing.id, user.id);
  }
}
