# Database — Foundation Schema

PostgreSQL 16 via Prisma. Migration directory: `prisma/migrations/`.

## Tables (0.1.0)

| Table | Purpose |
|-------|---------|
| `companies` | Tenant root |
| `branches` | Store locations |
| `users` | Staff accounts |
| `roles` | RBAC roles (system + custom) |
| `permissions` | Atomic permission codes |
| `role_permissions` | Role ↔ permission |
| `user_roles` | User ↔ role |
| `devices` | POS device registry |
| `refresh_tokens` | Refresh token hashes |

## Common columns

Every table includes:

| Column | Notes |
|--------|-------|
| `id` | UUID PK |
| `company_id` | Tenant scope (nullable only for pure system rows) |
| `branch_id` | Branch scope (nullable when company-wide) |
| `created_at` / `updated_at` | Timestamptz |
| `deleted_at` | Soft delete |
| `version` | Increment on mutation |
| `created_by` / `updated_by` | Actor UUID |

## Device fields

`device_uuid`, `platform`, `device_name`, `app_version`, `branch_id`, `last_sync_at`, `status` (`PENDING` \| `ACTIVE` \| `SUSPENDED` \| `REVOKED`).
