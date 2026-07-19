import type { PrismaClient } from '@prisma/client';
import type { IHealthRepository } from './interfaces';

export class HealthRepository implements IHealthRepository {
  constructor(private readonly db: PrismaClient) {}

  async checkDatabase(): Promise<boolean> {
    await this.db.$queryRaw`SELECT 1`;
    return true;
  }
}
