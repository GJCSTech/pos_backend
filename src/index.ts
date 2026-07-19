import { createApp } from './app';
import { env } from './config/env';
import { createContainer } from './container';
import { connectDatabase, disconnectDatabase } from './database/prisma';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const container = createContainer();
  const app = createApp(container);

  const server = app.listen(env.PORT, () => {
    logger.info('VJ Garden POS Backend started', {
      port: env.PORT,
      env: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/docs`,
      api: `http://localhost:${env.PORT}${env.API_PREFIX}`,
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start server', {
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
  });
  process.exit(1);
});
