import type { PrismaClient } from '@prisma/client';
import type { IUserRepository, UserWithAuth } from './interfaces';

const authInclude = {
  company: { select: { id: true, code: true, name: true, isActive: true } },
  branch: { select: { id: true, code: true, name: true, isActive: true } },
  userRoles: {
    where: { deletedAt: null },
    include: {
      role: {
        include: {
          rolePermissions: {
            where: { deletedAt: null },
            include: {
              permission: { select: { code: true } },
            },
          },
        },
      },
    },
  },
} as const;

export class UserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findForAuth(usernameOrEmail: string, companyCode?: string): Promise<UserWithAuth | null> {
    const normalized = usernameOrEmail.trim().toLowerCase();
    return this.db.user.findFirst({
      where: {
        deletedAt: null,
        ...(companyCode
          ? { company: { code: companyCode.trim().toUpperCase(), deletedAt: null } }
          : {}),
        OR: [{ email: normalized }, { username: normalized }],
      },
      include: authInclude,
    }) as Promise<UserWithAuth | null>;
  }

  async findByIdWithAuth(userId: string): Promise<UserWithAuth | null> {
    return this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: authInclude,
    }) as Promise<UserWithAuth | null>;
  }

  async recordFailedLogin(userId: string, lockedUntil: Date | null): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        failedLogins: { increment: 1 },
        lockedUntil,
        status: lockedUntil ? 'LOCKED' : undefined,
        version: { increment: 1 },
      },
    });
  }

  async recordSuccessfulLogin(userId: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        version: { increment: 1 },
      },
    });
  }
}
