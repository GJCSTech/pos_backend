import type { Device, DeviceStatus, PrismaClient } from '@prisma/client';
import type { IDeviceRepository, RegisterDeviceData } from './interfaces';

export class DeviceRepository implements IDeviceRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByCompanyAndUuid(companyId: string, deviceUuid: string): Promise<Device | null> {
    return this.db.device.findFirst({
      where: { companyId, deviceUuid, deletedAt: null },
    });
  }

  async findById(companyId: string, deviceId: string): Promise<Device | null> {
    return this.db.device.findFirst({
      where: { id: deviceId, companyId, deletedAt: null },
    });
  }

  async listByCompany(companyId: string, branchId?: string): Promise<Device[]> {
    return this.db.device.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertRegistration(data: RegisterDeviceData): Promise<Device> {
    const existing = await this.findByCompanyAndUuid(data.companyId, data.deviceUuid);

    if (existing) {
      return this.db.device.update({
        where: { id: existing.id },
        data: {
          platform: data.platform,
          deviceName: data.deviceName,
          appVersion: data.appVersion,
          branchId: data.branchId,
          metadata: data.metadata,
          status: existing.status === 'REVOKED' ? 'PENDING' : existing.status,
          registeredById: data.registeredById,
          updatedBy: data.createdBy,
          version: { increment: 1 },
        },
      });
    }

    return this.db.device.create({
      data: {
        companyId: data.companyId,
        branchId: data.branchId,
        deviceUuid: data.deviceUuid,
        platform: data.platform,
        deviceName: data.deviceName,
        appVersion: data.appVersion,
        status: 'ACTIVE',
        registeredById: data.registeredById,
        metadata: data.metadata,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
    });
  }

  async updateStatus(deviceId: string, status: DeviceStatus, updatedBy: string): Promise<Device> {
    return this.db.device.update({
      where: { id: deviceId },
      data: { status, updatedBy, version: { increment: 1 } },
    });
  }

  async touchLastSync(deviceId: string): Promise<Device> {
    return this.db.device.update({
      where: { id: deviceId },
      data: { lastSyncAt: new Date(), version: { increment: 1 } },
    });
  }
}
