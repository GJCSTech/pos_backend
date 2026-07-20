# API Reference — 0.2.1

Base path: `/api/v1`  
Interactive docs: `/docs`  
OpenAPI JSON: `/docs.json`

## Response envelope

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

Failure:

```json
{
  "success": false,
  "message": "Invalid username or password",
  "errors": {
    "code": "AUTH_INVALID",
    "details": null,
    "requestId": "uuid"
  }
}
```

Validation failures use `errors.code = "VALIDATION_ERROR"` with Zod `flatten()` details.

## Common list query parameters

| Param | Type | Notes |
|-------|------|-------|
| `page` | int ≥ 1 | default `1` |
| `pageSize` | 1–100 | default `20` |
| `search` | string ≤ 200 | resource-specific fields |
| `sortBy` | string | unsupported values fall back to `createdAt` |
| `sortOrder` | `asc` \| `desc` | default `desc` |
| `branchId` | uuid | optional branch scope |
| `isActive` | bool | when applicable |
| `updatedSince` | ISO datetime | incremental sync watermark |
| `createdFrom` / `createdTo` | ISO datetime | createdAt range |

All path `:id` parameters must be UUIDs (`400` otherwise).

## Auth & devices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Liveness + DB |
| `POST` | `/auth/login` | No | Access + refresh tokens |
| `POST` | `/auth/refresh` | No | Rotate tokens |
| `POST` | `/auth/logout` | No | Revoke refresh |
| `GET` | `/auth/me` | Bearer | Current user + roles/permissions |
| `POST` | `/devices/register` | `device.register` | Register/update device |
| `GET` | `/devices` | `device.view` | List devices |
| `GET` | `/devices/:id` | `device.view` | Device detail |

**Users / Roles / Permissions:** no dedicated CRUD in 0.2.x. Roles and permissions are seeded and returned on `/auth/me`.

## Business modules

All business routes require `Authorization: Bearer <accessToken>` and matching `*.view` / `*.manage` permission.

| Module | Base paths | Permission |
|--------|------------|------------|
| Catalog | `/product-categories`, `/product-attributes`, `/units`, `/tax-masters`, `/products`, `/product-variants` | `catalog.*` |
| Suppliers | `/suppliers` | `supplier.*` |
| Customers | `/customers`, `/customer-groups` | `customer.*` |
| Inventory | `/inventories`, `/stock-movements`, `/opening-stocks` | `inventory.*` |
| Purchases | `/purchases`, `/purchase-returns` | `purchase.*` |
| Sales | `/sales`, `/hold-bills`, `/payments` | `sales.*` |
| Settings | `/business-settings`, `/receipt-settings` | `settings.*` |

### Workflow endpoints

| Flow | Steps |
|------|-------|
| Purchase → stock | `POST /purchases` → `POST /purchases/:id/receive` |
| Purchase return | `POST /purchase-returns` → `POST /purchase-returns/:id/complete` |
| Opening stock | `POST /opening-stocks` → `POST /opening-stocks/:id/post` |
| Sale + payment | `POST /sales` with `status=COMPLETED` + `payments[]` |
| Hold bill | `POST /hold-bills` → `POST /hold-bills/:id/resume` with payments |
| Stock adjust | `POST /inventories/adjust` |
| Low stock / value | `GET /inventories/low-stock`, `GET /inventories/value` |

## Mobile guidance

- Use UUID `id` fields as stable offline keys.
- Timestamps are UTC (`Timestamptz`).
- Prefer `updatedSince` for delta sync until the dedicated sync engine ships.
- On `errors.code = CONFLICT` for inventory, retry once after refresh.
- Soft-deleted rows set `deletedAt`; list endpoints exclude them by default.

Full request/response examples: open Swagger at `/docs`.
