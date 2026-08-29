# Backend Release 0.3.0

**Date:** 2026-08-29  
**Codename:** Financial & Transaction Integrity (Phase 1)  
**Tag:** `v0.3.0`

## Purpose

Fix four confirmed financial/transactional-integrity defects identified in the post-0.2.1 audit, ahead of connecting the VJGardenPOS mobile app to this backend. No new business modules. Clean Architecture preserved. No Prisma migration required.

## Delivered

### Payment reversal

- `DELETE /payments/:id` now performs a transactional void instead of a silent soft-delete: it reverses `Sale.paidAmount` or (`Purchase.paidAmount` + `Supplier.outstandingBalance`) by exactly the voided payment's amount, then marks the payment `REFUNDED`
- Voiding an already-voided payment returns `409 CONFLICT`
- Split payments are unaffected beyond the specific row being voided

### Customer / Supplier balance protection

- `PATCH /customers/:id` and `PATCH /suppliers/:id` no longer accept `outstandingBalance` (and, for customers, `loyaltyPoints`) — these fields are silently stripped by validation
- Opening-balance entry via `POST /customers` and `POST /suppliers` (create) is unaffected
- All transactional writers of these balances (purchase receive, purchase return, payment create/void) are unaffected — they write directly to the database and never went through these endpoints

### Stock movement accuracy

- `POST /stock-movements` now persists the caller's actual `movementType`, `referenceType`, `referenceId`, and `occurredAt` instead of always recording a generic `ADJUSTMENT` with no reference
- Added quantity-sign validation per `movementType` (e.g. `PURCHASE`/`SALE_RETURN`/`TRANSFER_IN`/`OPENING` require a positive quantity; `SALE`/`PURCHASE_RETURN`/`TRANSFER_OUT` require a negative quantity; `ADJUSTMENT` is unconstrained)
- `POST /inventories/adjust` is unchanged — it continues to always record `ADJUSTMENT`

### Hold-bill atomicity

- `POST /hold-bills`, `POST /hold-bills/:id/resume`, and `POST /hold-bills/:id/cancel` now perform the sale-side operation and the hold-bill-row write inside a single database transaction — a crash or error partway through can no longer leave an orphaned sale or an inconsistent hold-bill row
- `SaleService.create`/`update`/`complete`/`remove` now accept an optional transaction client so other services can compose them into a shared transaction, following the same pattern already used by `InventoryService.applyMovement`

### Tests

- New unit tests: `PaymentService`, `StockMovementService`, `HoldBillService`, `customer.schemas`, `supplier.schemas`, `stockMovement.schemas`
- Extended `SaleService` tests to cover the new transaction-composition behavior
- All existing tests continue to pass unmodified

## Explicitly out of scope

- Idempotency-Key support for POS retries
- Tombstone/deletion sync for incremental mobile pulls
- Device authorization / device-bound access tokens
- Branch-membership security redesign
- Docker / production deployment changes
- Cursor-based pagination
- Web POS work
- `SaleService.update`'s existing payment-replacement-on-update logic (a separate, pre-existing code path that bypasses `PaymentService` and was not touched by this phase)

## Upgrade

```bash
npm install
npm run build
npm test
```

No `prisma migrate deploy` is required for this release — the schema is unchanged.

## Mobile integration notes

1. `DELETE /payments/:id` now correctly reverses balances; repeat calls on an already-voided payment still return `404 NOT FOUND` in the common case (the row is already excluded once `deletedAt` is set), with a `409 CONFLICT` reserved for a same-row concurrent-void race.
2. `PATCH /customers/:id` and `PATCH /suppliers/:id` now silently ignore `outstandingBalance`/`loyaltyPoints` if sent — these fields are computed server-side and are no longer settable via generic update.
3. `POST /stock-movements` now validates quantity sign against `movementType` — a request that previously succeeded with a mismatched sign (since it was always recorded as `ADJUSTMENT`) will now return `400 VALIDATION_ERROR`. Confirm mobile does not rely on the previous permissive behavior for this endpoint.

## Next (planned, not started)

- Offline sync protocol
- Idempotency keys for POS retries
- Tombstone propagation for soft-deletes
- Branch-scope enforcement beyond client-supplied `branchId`
- Device authorization / approval workflow
