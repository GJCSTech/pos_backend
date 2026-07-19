# Backend Architecture — Release 0.2.0

## Goals

Provide a production-ready centralized API for offline-first POS devices. Release **0.1.0** delivered tenant identity, RBAC, and device registry. Release **0.2.0** adds the enterprise business core (catalog, inventory, purchase, sales, settings). Sync engine remains a future release.

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Presentation | `controllers/`, `routes/`, `middleware/` | HTTP, validation, authn/z |
| Application | `services/` | Use cases, orchestration, transactions |
| Domain contracts | `repositories/*` interfaces, `types/` | Ports |
| Infrastructure | `repositories/*`, `database/`, `utils/` | Prisma, JWT, logging |

Dependency rule: outer layers depend inward. Controllers never call Prisma directly.

## Multi-tenant model

```
Company
  └── Branch
        ├── User (+ UserRole → Role → Permission)
        ├── Device
        ├── Catalog / Parties / Inventory
        └── Purchases / Sales / Settings
```

All business rows carry `companyId` / `branchId` for multi-company / multi-branch readiness.

## Auth flow

1. `POST /auth/login` verifies password (bcrypt), issues JWT access + opaque-style refresh JWT.
2. Refresh token hash (SHA-256) stored in `refresh_tokens`.
3. `POST /auth/refresh` rotates refresh token (revoke previous).
4. Protected routes require `Authorization: Bearer <access>` and permission checks.

## Business patterns (0.2.0)

- Repository pattern + service layer + Zod validators
- Pagination / search / sort via shared `listQuerySchema`
- Soft delete (`deletedAt`) + `version` increments on mutation
- Inventory mutations run inside Prisma transactions
- Purchase receive / sale complete apply stock movements and recalculate averages

## Sync readiness

- UUID primary keys align with mobile `uuid` sync identity.
- `version` column for optimistic concurrency.
- `deletedAt` soft deletes for tombstone propagation.
- Device registry tracks `lastSyncAt` for future sync sessions.
