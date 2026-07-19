import type { PrismaClient, RefreshToken } from '@prisma/client';
import type { IRefreshTokenRepository } from './interfaces';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    id: string;
    companyId: string;
    branchId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    createdBy?: string;
  }): Promise<RefreshToken> {
    return this.db.refreshToken.create({
      data: {
        id: data.id,
        companyId: data.companyId,
        branchId: data.branchId,
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
    });
  }

  async findValidByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async revoke(tokenId: string, replacedByTokenId?: string): Promise<void> {
    await this.db.refreshToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
        replacedByTokenId,
        version: { increment: 1 },
      },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null, deletedAt: null },
      data: { revokedAt: new Date(), version: { increment: 1 } },
    });
  }
}
