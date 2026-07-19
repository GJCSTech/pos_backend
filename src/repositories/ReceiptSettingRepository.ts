import type { Prisma, PrismaClient, ReceiptSetting } from '@prisma/client';

export interface IReceiptSettingRepository {
  findByBranch(companyId: string, branchId: string): Promise<ReceiptSetting | null>;
  upsert(
    companyId: string,
    branchId: string,
    data: Prisma.ReceiptSettingUncheckedCreateInput,
  ): Promise<ReceiptSetting>;
  softDelete(id: string, updatedBy: string): Promise<ReceiptSetting>;
}

export class ReceiptSettingRepository implements IReceiptSettingRepository {
  constructor(private readonly db: PrismaClient) {}

  findByBranch(companyId: string, branchId: string): Promise<ReceiptSetting | null> {
    return this.db.receiptSetting.findFirst({
      where: { companyId, branchId, deletedAt: null },
    });
  }

  upsert(
    companyId: string,
    branchId: string,
    data: Prisma.ReceiptSettingUncheckedCreateInput,
  ): Promise<ReceiptSetting> {
    return this.db.receiptSetting.upsert({
      where: {
        companyId_branchId: { companyId, branchId },
      },
      create: data,
      update: {
        ...data,
        deletedAt: null,
        version: { increment: 1 },
      },
    });
  }

  softDelete(id: string, updatedBy: string): Promise<ReceiptSetting> {
    return this.db.receiptSetting.update({
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
