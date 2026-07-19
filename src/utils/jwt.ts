import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth';

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (payload.type !== 'access') {
      throw new AppError('AUTH_TOKEN_INVALID', 'Invalid access token', 401);
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 'Access token expired', 401);
    }
    throw new AppError('AUTH_TOKEN_INVALID', 'Invalid access token', 401);
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (payload.type !== 'refresh') {
      throw new AppError('AUTH_TOKEN_INVALID', 'Invalid refresh token', 401);
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 'Refresh token expired', 401);
    }
    throw new AppError('AUTH_TOKEN_INVALID', 'Invalid refresh token', 401);
  }
}

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60_000;
    case 'h':
      return value * 3_600_000;
    case 'd':
      return value * 86_400_000;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
}
