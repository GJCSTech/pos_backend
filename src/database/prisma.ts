import { PrismaClient } from '@prisma/client';
import { env, isProduction } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __vjPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: env.DATABASE_URL },
    },
    log: isProduction ? ['error'] : ['error', 'warn'],
  });
}

export const prisma: PrismaClient = global.__vjPrisma ?? createPrismaClient();

if (!isProduction) {
  global.__vjPrisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('PostgreSQL connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('PostgreSQL disconnected');
}
