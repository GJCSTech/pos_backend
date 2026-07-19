export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_INVALID'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export function notFound(message = 'Resource not found', details?: unknown): AppError {
  return new AppError('NOT_FOUND', message, 404, details);
}

export function unauthorized(message = 'Unauthorized', details?: unknown): AppError {
  return new AppError('AUTH_UNAUTHORIZED', message, 401, details);
}

export function forbidden(message = 'Forbidden', details?: unknown): AppError {
  return new AppError('AUTH_FORBIDDEN', message, 403, details);
}

export function conflict(message: string, details?: unknown): AppError {
  return new AppError('CONFLICT', message, 409, details);
}

export function validationError(message: string, details?: unknown): AppError {
  return new AppError('VALIDATION_ERROR', message, 400, details);
}

export function authInvalid(message = 'Invalid username or password'): AppError {
  return new AppError('AUTH_INVALID', message, 401);
}
