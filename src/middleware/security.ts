import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { RequestHandler } from 'express';
import { env } from '../config/env';

export const helmetMiddleware = helmet();

export const compressionMiddleware = compression();

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
});

export const rateLimiter: RequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: {
      code: 'RATE_LIMITED',
    },
  },
});

export const authRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts',
    errors: {
      code: 'RATE_LIMITED',
    },
  },
});
