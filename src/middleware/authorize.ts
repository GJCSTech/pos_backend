import type { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../errors/AppError';

export function requirePermissions(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (req.user.roles.includes('SUPER_ADMIN')) {
      next();
      return;
    }

    const missing = required.filter((code) => !req.user!.permissions.includes(code));
    if (missing.length > 0) {
      next(forbidden(`Missing permissions: ${missing.join(', ')}`));
      return;
    }

    next();
  };
}

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    const allowed = roles.some((role) => req.user!.roles.includes(role));
    if (!allowed) {
      next(forbidden(`Requires one of roles: ${roles.join(', ')}`));
      return;
    }

    next();
  };
}
