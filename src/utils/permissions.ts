import { forbidden } from '../errors/AppError';
import type { AuthUser } from '../types/auth';

export function hasPermission(user: AuthUser, permission: string): boolean {
  if (user.roles.includes('SUPER_ADMIN')) {
    return true;
  }
  return user.permissions.includes(permission);
}

export function assertPermission(user: AuthUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw forbidden(`Missing permission: ${permission}`);
  }
}

export function assertAnyPermission(user: AuthUser, permissions: string[]): void {
  if (user.roles.includes('SUPER_ADMIN')) {
    return;
  }
  if (!permissions.some((permission) => user.permissions.includes(permission))) {
    throw forbidden(`Missing permission: ${permissions.join(' or ')}`);
  }
}
