import { toAuthUser } from '../../src/services/authMapper';
import type { UserWithAuth } from '../../src/repositories/interfaces';

describe('toAuthUser', () => {
  it('flattens roles and permissions', () => {
    const user = {
      id: 'u1',
      companyId: 'c1',
      branchId: 'b1',
      email: 'a@b.c',
      username: 'admin',
      displayName: 'Admin',
      passwordHash: 'x',
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
      company: { id: 'c1', code: 'VJGARDEN', name: 'VJ', isActive: true },
      branch: { id: 'b1', code: 'MAIN', name: 'Main', isActive: true },
      userRoles: [
        {
          role: {
            code: 'STORE_ADMIN',
            rolePermissions: [
              { permission: { code: 'device.view' } },
              { permission: { code: 'device.register' } },
            ],
          },
        },
      ],
    } as unknown as UserWithAuth;

    const auth = toAuthUser(user);
    expect(auth.roles).toEqual(['STORE_ADMIN']);
    expect(auth.permissions).toEqual(expect.arrayContaining(['device.view', 'device.register']));
  });
});
