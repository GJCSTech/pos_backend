import type { AuthUser } from '../types/auth';
import type { UserWithAuth } from '../repositories/interfaces';

export function toAuthUser(user: UserWithAuth): AuthUser {
  const roles = Array.from(
    new Set(user.userRoles.map((ur) => ur.role.code).filter(Boolean)),
  );
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.code),
      ),
    ),
  );

  return {
    id: user.id,
    companyId: user.companyId,
    branchId: user.branchId,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    roles,
    permissions,
  };
}
