import { AuthService } from '../../src/services/AuthService';
import type { IRefreshTokenRepository, IUserRepository, UserWithAuth } from '../../src/repositories/interfaces';
import { hashPassword } from '../../src/utils/password';
import { AppError } from '../../src/errors/AppError';

function buildUser(overrides: Partial<UserWithAuth> = {}): UserWithAuth {
  return {
    id: 'user-1',
    companyId: 'company-1',
    branchId: 'branch-1',
    email: 'admin@vjgarden.local',
    username: 'admin',
    displayName: 'Admin',
    passwordHash: '',
    phone: null,
    status: 'ACTIVE',
    failedLogins: 0,
    lockedUntil: null,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
    company: { id: 'company-1', code: 'VJGARDEN', name: 'VJ', isActive: true },
    branch: { id: 'branch-1', code: 'MAIN', name: 'Main', isActive: true },
    userRoles: [
      {
        role: {
          code: 'SUPER_ADMIN',
          rolePermissions: [{ permission: { code: 'device.register' } }],
        },
      },
    ],
    ...overrides,
  } as UserWithAuth;
}

describe('AuthService', () => {
  it('logs in with valid credentials and issues tokens', async () => {
    const passwordHash = await hashPassword('ChangeMeAdmin!2026');
    const user = buildUser({ passwordHash });

    const users: IUserRepository = {
      findForAuth: jest.fn().mockResolvedValue(user),
      findByIdWithAuth: jest.fn(),
      recordFailedLogin: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
    };

    const refreshTokens: IRefreshTokenRepository = {
      create: jest.fn().mockResolvedValue({}),
      findValidByHash: jest.fn(),
      revoke: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    const service = new AuthService(users, refreshTokens);
    const result = await service.login(
      { usernameOrEmail: 'admin', password: 'ChangeMeAdmin!2026' },
      { ipAddress: '127.0.0.1' },
    );

    expect(result.user.username).toBe('admin');
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();
    expect(users.recordSuccessfulLogin).toHaveBeenCalledWith('user-1');
    expect(refreshTokens.create).toHaveBeenCalled();
  });

  it('rejects invalid passwords and records failure', async () => {
    const passwordHash = await hashPassword('ChangeMeAdmin!2026');
    const user = buildUser({ passwordHash });

    const users: IUserRepository = {
      findForAuth: jest.fn().mockResolvedValue(user),
      findByIdWithAuth: jest.fn(),
      recordFailedLogin: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
    };

    const refreshTokens: IRefreshTokenRepository = {
      create: jest.fn(),
      findValidByHash: jest.fn(),
      revoke: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    const service = new AuthService(users, refreshTokens);

    await expect(
      service.login({ usernameOrEmail: 'admin', password: 'wrong' }, {}),
    ).rejects.toBeInstanceOf(AppError);

    expect(users.recordFailedLogin).toHaveBeenCalled();
  });
});
