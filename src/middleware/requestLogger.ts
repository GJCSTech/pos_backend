import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now();

  res.on('finish', () => {
    logger.http('HTTP request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - started,
      userId: req.user?.id,
      ip: req.ip,
    });
  });

  next();
}
