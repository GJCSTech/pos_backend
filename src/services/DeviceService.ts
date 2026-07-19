import type { Device, Prisma } from '@prisma/client';
import { forbidden, notFound } from '../errors/AppError';
import type { IDeviceRepository } from '../repositories/interfaces';
import type { AuthUser } from '../types/auth';
import type { RegisterDeviceInput } from '../validators/device.schemas';

export class DeviceService {
  constructor(private readonly devices: IDeviceRepository) {}

  async register(user: AuthUser, input: RegisterDeviceInput): Promise<Device> {
    if (!user.permissions.includes('device.register') && !user.roles.includes('SUPER_ADMIN')) {
      throw forbidden('Missing permission: device.register');
    }

    const branchId = input.branchId ?? user.branchId;
    const metadata = input.metadata as Prisma.InputJsonValue | undefined;

    return this.devices.upsertRegistration({
      companyId: user.companyId,
      branchId,
      deviceUuid: input.deviceUuid,
      platform: input.platform,
      deviceName: input.deviceName,
      appVersion: input.appVersion,
      registeredById: user.id,
      metadata,
      createdBy: user.id,
    });
  }

  async getById(user: AuthUser, deviceId: string): Promise<Device> {
    this.assertCanView(user);
    const device = await this.devices.findById(user.companyId, deviceId);
    if (!device) {
      throw notFound('Device not found');
    }
    return device;
  }

  async list(user: AuthUser, branchId?: string): Promise<Device[]> {
    this.assertCanView(user);
    return this.devices.listByCompany(user.companyId, branchId);
  }

  private assertCanView(user: AuthUser): void {
    if (
      !user.permissions.includes('device.view') &&
      !user.roles.includes('SUPER_ADMIN') &&
      !user.roles.includes('STORE_ADMIN')
    ) {
      throw forbidden('Missing permission: device.view');
    }
  }
}
