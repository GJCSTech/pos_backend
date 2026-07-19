import type {
  Device,
  DevicePlatform,
  DeviceStatus,
  Prisma,
  RefreshToken,
  User,
} from '@prisma/client';

export type UserWithAuth = User & {
  userRoles: Array<{
    role: {
      code: string;
      rolePermissions: Array<{
        permission: { code: string };
      }>;
    };
  }>;
  company: { id: string; code: string; name: string; isActive: boolean };
  branch: { id: string; code: string; name: string; isActive: boolean };
};

export interface IUserRepository {
  findForAuth(usernameOrEmail: string, companyCode?: string): Promise<UserWithAuth | null>;
  findByIdWithAuth(userId: string): Promise<UserWithAuth | null>;
  recordFailedLogin(userId: string, lockedUntil: Date | null): Promise<void>;
  recordSuccessfulLogin(userId: string): Promise<void>;
}

export interface IRefreshTokenRepository {
  create(data: {
    id: string;
    companyId: string;
    branchId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    createdBy?: string;
  }): Promise<RefreshToken>;
  findValidByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(tokenId: string, replacedByTokenId?: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export interface RegisterDeviceData {
  companyId: string;
  branchId: string;
  deviceUuid: string;
  platform: DevicePlatform;
  deviceName: string;
  appVersion: string;
  registeredById: string;
  metadata?: Prisma.InputJsonValue;
  createdBy: string;
}

export interface IDeviceRepository {
  findByCompanyAndUuid(companyId: string, deviceUuid: string): Promise<Device | null>;
  findById(companyId: string, deviceId: string): Promise<Device | null>;
  listByCompany(companyId: string, branchId?: string): Promise<Device[]>;
  upsertRegistration(data: RegisterDeviceData): Promise<Device>;
  updateStatus(deviceId: string, status: DeviceStatus, updatedBy: string): Promise<Device>;
  touchLastSync(deviceId: string): Promise<Device>;
}

export interface IHealthRepository {
  checkDatabase(): Promise<boolean>;
}
