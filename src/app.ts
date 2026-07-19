import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import type { AppContainer } from './container';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import {
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware,
  rateLimiter,
} from './middleware/security';
import { createRoutes } from './routes';
import { openApiSpec } from './swagger/openapi';

export function createApp(container: AppContainer) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compressionMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(rateLimiter);
  app.use(requestLogger);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(env.API_PREFIX, createRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
