# Backend Architecture — Release 0.1.0

## Goals

Provide a production-ready centralized API that will synchronize offline SQLite POS devices with PostgreSQL, starting with tenant identity, RBAC, and device registry.

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Presentation | `controllers/`, `routes/`, `middleware/` | HTTP, validation, authn/z |
| Application | `services/` | Use cases, orchestration |
| Domain contracts | `repositories/interfaces.ts`, `types/` | Ports |
| Infrastructure | `repositories/*`, `database/`, `utils/` | Prisma, JWT, logging |

Dependency rule: outer layers depend inward. Controllers never call Prisma directly.

## Multi-tenant model

```
Company
  └── Branch
        ├── User (+ UserRole → Role → Permission)
        └── Device
```

All business rows carry `companyId` / `branchId` for future branch-scoped sync filters.

## Auth flow

1. `POST /auth/login` verifies password (bcrypt), issues JWT access + opaque-style refresh JWT.
2. Refresh token hash (SHA-256) stored in `refresh_tokens`.
3. `POST /auth/refresh` rotates refresh token (revoke previous).
4. Protected routes require `Authorization: Bearer <access>` and permission checks.

## Sync readiness

- UUID primary keys align with mobile `uuid` sync identity.
- `version` column for optimistic concurrency.
- `deletedAt` soft deletes for tombstone propagation.
- Device registry tracks `lastSyncAt` for future sync sessions.
