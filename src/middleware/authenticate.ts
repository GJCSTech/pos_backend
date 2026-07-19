import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Missing or invalid Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next(unauthorized('Missing access token'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      companyId: payload.companyId,
      branchId: payload.branchId,
      email: payload.email,
      username: payload.username,
      displayName: payload.displayName,
      roles: payload.roles,
      permissions: payload.permissions,
    };
    next();
  } catch (error) {
    next(error);
  }
}
