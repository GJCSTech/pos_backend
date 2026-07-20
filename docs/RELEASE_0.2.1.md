# Backend Release 0.2.1

**Date:** 2026-07-19  
**Codename:** Backend Hardening & Mobile Integration Readiness  
**Tag:** `v0.2.1`

## Purpose

Make the existing 0.2.0 enterprise business APIs production-ready for the React Native POS client. No new business modules. Clean Architecture preserved.

## Delivered

### API contract

- Standardized success envelope: `{ success, message, data, meta? }`
- Standardized failure envelope: `{ success, message, errors: { code, details?, requestId? } }`
- Soft-deletes for products/variants now return `200` + envelope (no bare `204`)
- Inventory valuation and hold-bill resume use named `data` keys

### Validation & errors

- UUID path-parameter validation on all `/:id` routes
- Branch query validation for devices, inventory value, receipt settings
- Stronger sale/purchase/hold-bill/inventory Zod rules (ranges, COMPLETED payments, hold payload)
- Central mapping for invalid JSON, Prisma unique/FK/not-found errors
- Purchase return completion capped to remaining returnable quantity

### Mobile readiness

- List queries support `updatedSince`, `createdFrom`, `createdTo`
- Pagination meta includes `hasNext` / `hasPrev`
- Low-stock endpoint is paginated
- Sync indexes on `updatedAt` for products, inventories, suppliers, customers, purchases, sales

### Inventory hardening

- Optimistic concurrency on inventory quantity updates (version + quantity check)

### Documentation

- Swagger bumped to 0.2.1 with envelope schemas, error responses, examples, sync query params
- README, CHANGELOG, `docs/API.md`, `docs/ARCHITECTURE.md` updated

## Explicitly out of scope

- Release 0.3.0 / new business modules
- Offline sync engine (push/pull protocol)
- User / Role / Permission CRUD APIs (still managed via seed + `/auth/me`)
- Full payment refund financial reversal
- Atomic multi-step hold-bill orchestration refactor

## Upgrade

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm test
```

## Mobile integration notes

1. Prefer `/docs` or `/docs.json` as the contract source of truth.
2. Persist `updatedSince` per entity collection for incremental pulls.
3. Treat all IDs as UUIDs; all timestamps as ISO-8601 UTC (`Timestamptz`).
4. Expect `errors.code` for programmatic handling; show `message` to operators.
5. Retry inventory conflicts (`CONFLICT` / concurrent modification) once on POS.

## Next (planned, not started)

- Offline sync protocol
- Idempotency keys for POS retries
- Branch-scope enforcement beyond client-supplied `branchId`
- Payment refund → sale/purchase balance reversal
