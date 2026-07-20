# Phase 1 — Full API Audit (Release 0.2.1)

Audit performed before hardening changes. Status column reflects post-0.2.1 remediation where applicable.

## Module inventory

| Module | CRUD / surface | Routes | Auth | Status |
|--------|----------------|--------|------|--------|
| Health | Read | `GET /health` | Public | OK |
| Auth | Login/refresh/logout/me | `/auth/*` | Mixed | OK |
| Devices | Register + read | `/devices/*` | RBAC | OK |
| Users | No CRUD API | via `/auth/me` | — | Intentional (seed) |
| Roles | No CRUD API | via `/auth/me` | — | Intentional (seed) |
| Permissions | No CRUD API | via `/auth/me` | — | Intentional (seed) |
| Product categories | Full CRUD | `/product-categories` | catalog.* | OK |
| Attributes | Full CRUD | `/product-attributes` | catalog.* | OK |
| Units | Full CRUD | `/units` | catalog.* | OK |
| Tax | Full CRUD | `/tax-masters` | catalog.* | OK |
| Products | Full CRUD | `/products` | catalog.* | OK |
| Variants | Full CRUD | `/product-variants` | catalog.* | OK |
| Suppliers | Full CRUD | `/suppliers` | supplier.* | OK |
| Customers | Full CRUD | `/customers` | customer.* | OK |
| Customer groups | Full CRUD | `/customer-groups` | customer.* | OK |
| Inventory | List/get/adjust/value/low-stock | `/inventories*` | inventory.* | OK (non-CRUD by design) |
| Stock movements | List/get/create | `/stock-movements` | inventory.* | OK |
| Opening stock | List/get/create/post/delete | `/opening-stocks` | inventory.* | OK |
| Purchases | CRUD + receive | `/purchases` | purchase.* | OK |
| Purchase returns | CRUD + complete | `/purchase-returns` | purchase.* | OK |
| Sales | CRUD + complete | `/sales` | sales.* | OK |
| Hold bills | List/get/create/resume/cancel | `/hold-bills` | sales.* | OK |
| Payments | List/get/create/delete | `/payments` | sales.* | OK |
| Business settings | Full CRUD | `/business-settings` | settings.* | OK |
| Receipt settings | Get/upsert/delete | `/receipt-settings` | settings.* | OK (singleton) |

## Findings addressed in 0.2.1

1. Response envelope lacked top-level `message` / standardized `errors`
2. Product/variant deletes returned bare `204`
3. Path `:id` UUIDs unvalidated → potential 500s
4. Prisma/JSON errors not mapped to stable 4xx codes
5. Low-stock unpaginated
6. No `updatedSince` / date-range list filters for mobile
7. Swagger incomplete (examples, error schemas, sync params)
8. Purchase returns uncapped vs received qty
9. Inventory read-modify-write race on concurrent sales

## Remaining recommendations (not in 0.2.1)

1. Enforce branch membership server-side (reject foreign `branchId`)
2. Idempotency-Key support for POS retries on complete/receive/resume
3. Payment delete should reverse sale/purchase paid totals + supplier balance
4. Wrap hold-bill create/resume/cancel in a single transaction boundary
5. Cursor pagination for very large catalogs
6. Dedicated User/Role admin APIs if admin portal needs them before sync
