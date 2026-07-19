import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import type { ApiErrorResponse } from '../types/api';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten(),
        requestId: req.requestId,
      },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error', { err, requestId: req.requestId });
    }
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.requestId,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
  });

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Internal server error' : err instanceof Error ? err.message : 'Unknown error',
      requestId: req.requestId,
    },
  };
  res.status(500).json(body);
}
