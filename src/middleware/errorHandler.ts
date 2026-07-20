import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { fail, type ApiErrorResponse } from '../types/api';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function sendError(res: Response, status: number, body: ApiErrorResponse): void {
  res.status(status).json(body);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (err instanceof ZodError) {
    sendError(
      res,
      400,
      fail('Request validation failed', {
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
        requestId: req.requestId,
      }),
    );
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error', { err, requestId: req.requestId });
    }
    sendError(
      res,
      err.statusCode,
      fail(err.message, {
        code: err.code,
        details: err.details,
        requestId: req.requestId,
      }),
    );
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    sendError(
      res,
      400,
      fail('Invalid JSON payload', {
        code: 'VALIDATION_ERROR',
        requestId: req.requestId,
      }),
    );
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(
        res,
        409,
        fail('A record with this unique value already exists', {
          code: 'CONFLICT',
          details: { target: err.meta?.target },
          requestId: req.requestId,
        }),
      );
      return;
    }
    if (err.code === 'P2003') {
      sendError(
        res,
        400,
        fail('Related record not found or invalid reference', {
          code: 'VALIDATION_ERROR',
          details: { field: err.meta?.field_name },
          requestId: req.requestId,
        }),
      );
      return;
    }
    if (err.code === 'P2025') {
      sendError(
        res,
        404,
        fail('Record not found', {
          code: 'NOT_FOUND',
          requestId: req.requestId,
        }),
      );
      return;
    }
    if (err.code === 'P2023' || err.code === 'P2014') {
      sendError(
        res,
        400,
        fail('Invalid identifier or relation', {
          code: 'VALIDATION_ERROR',
          requestId: req.requestId,
        }),
      );
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(
      res,
      400,
      fail('Invalid request data for database operation', {
        code: 'VALIDATION_ERROR',
        requestId: req.requestId,
      }),
    );
    return;
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
  });

  sendError(
    res,
    500,
    fail(isProduction ? 'Internal server error' : err instanceof Error ? err.message : 'Unknown error', {
      code: 'INTERNAL_ERROR',
      requestId: req.requestId,
    }),
  );
}
