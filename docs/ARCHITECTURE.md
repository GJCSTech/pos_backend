# Backend Architecture — Release 0.2.1

## Goals

Provide a production-ready centralized API for offline-first POS devices.

- **0.1.0** — tenant identity, RBAC, device registry
- **0.2.0** — enterprise business core (catalog, inventory, purchase, sales, settings)
- **0.2.1** — API hardening, consistent contracts, validation, Swagger completeness, mobile list/sync readiness

Sync engine remains a future release.

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

All business rows carry `companyId` / `branchId`. List filters accept optional `branchId` (defaults to the authenticated user's branch).

## Auth flow

1. `POST /auth/login` verifies password (bcrypt), issues JWT access + refresh JWT.
2. Refresh token hash (SHA-256) stored in `refresh_tokens`.
3. `POST /auth/refresh` rotates refresh token (revoke previous).
4. Protected routes require `Authorization: Bearer <access>` and permission checks (`requirePermissions` + service-level `assertPermission`).

## API contract (0.2.1)

```
Success → { success: true, message, data, meta? }
Failure → { success: false, message, errors: { code, details?, requestId? } }
```

Cross-cutting middleware: Helmet, CORS, compression, rate limiting, request IDs, Zod validation (body/query/params), centralized error mapping (including Prisma + JSON parse).

## Business patterns

- Repository pattern + service layer + Zod validators
- Pagination / search / sort / date sync filters via shared `listQuerySchema`
- Soft delete (`deletedAt`) + `version` increments on mutation
- Inventory mutations run inside Prisma transactions with optimistic concurrency on qty updates
- Purchase receive / sale complete / purchase return complete apply stock movements

## Sync readiness

- UUID primary keys align with mobile sync identity
- `version` column for optimistic concurrency
- `deletedAt` soft deletes for tombstone propagation
- `updatedSince` list filter + `(companyId, updatedAt)` indexes for incremental pulls
- Device registry tracks `lastSyncAt` for future sync sessions

## Intentional non-CRUD surfaces

| Area | Pattern |
|------|---------|
| Inventory | Adjust / movements / opening post (not generic CRUD) |
| Hold bills | Create / resume / cancel |
| Payments | Create / soft-delete (refund path) |
| Receipt settings | Singleton upsert per branch |
| Users / Roles / Permissions | Seeded; exposed via `/auth/me` |
