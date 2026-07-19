import { DeviceService } from '../../src/services/DeviceService';
import type { IDeviceRepository } from '../../src/repositories/interfaces';
import type { AuthUser } from '../../src/types/auth';
import { AppError } from '../../src/errors/AppError';

describe('DeviceService', () => {
  const user: AuthUser = {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    roles: ['STORE_ADMIN'],
    permissions: ['device.register', 'device.view'],
  };

  it('registers a device for the user branch', async () => {
    const devices: IDeviceRepository = {
      findByCompanyAndUuid: jest.fn(),
      findById: jest.fn(),
      listByCompany: jest.fn(),
      upsertRegistration: jest.fn().mockResolvedValue({
        id: 'device-1',
        deviceUuid: '11111111-1111-4111-8111-111111111111',
      }),
      updateStatus: jest.fn(),
      touchLastSync: jest.fn(),
    };

    const service = new DeviceService(devices);
    const result = await service.register(user, {
      deviceUuid: '11111111-1111-4111-8111-111111111111',
      platform: 'ANDROID',
      deviceName: 'Counter 1',
      appVersion: '0.22.0',
    });

    expect(result.id).toBe('device-1');
    expect(devices.upsertRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        branchId: 'branch-1',
        deviceName: 'Counter 1',
      }),
    );
  });

  it('rejects registration without permission', async () => {
    const devices: IDeviceRepository = {
      findByCompanyAndUuid: jest.fn(),
      findById: jest.fn(),
      listByCompany: jest.fn(),
      upsertRegistration: jest.fn(),
      updateStatus: jest.fn(),
      touchLastSync: jest.fn(),
    };

    const service = new DeviceService(devices);
    await expect(
      service.register(
        { ...user, permissions: [], roles: ['SALES_USER'] },
        {
          deviceUuid: '11111111-1111-4111-8111-111111111111',
          platform: 'ANDROID',
          deviceName: 'Counter 1',
          appVersion: '0.22.0',
        },
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});
