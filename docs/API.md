# API Reference — 0.2.0

Base path: `/api/v1`  
Interactive docs: `/docs`  
OpenAPI JSON: `/docs.json`

## Response envelope

Success:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 } }
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid username or password",
    "requestId": "uuid"
  }
}
```

## Auth & devices

Unchanged from 0.1.0 — see `/docs` tags **Auth** and **Devices**.

## Business modules

All business routes require `Authorization: Bearer <accessToken>` and the matching permission (`*.view` / `*.manage`).

| Module | Permission prefix | Notes |
|--------|-------------------|-------|
| Catalog | `catalog.*` | Categories, attributes, units, taxes, products, variants |
| Suppliers | `supplier.*` | Supplier CRUD |
| Customers | `customer.*` | Customers + groups |
| Inventory | `inventory.*` | Stock, movements, opening stock, valuation |
| Purchases | `purchase.*` | Purchases, receive, returns |
| Sales | `sales.*` | Sales, hold bills, payments |
| Settings | `settings.*` | Business + receipt settings |

### Notable workflows

- `POST /purchases` then `POST /purchases/:id/receive` → stock IN + supplier outstanding
- `POST /opening-stocks` then `POST /opening-stocks/:id/post` → opening movement
- `POST /sales` with `payments[]` and `status=COMPLETED` → stock OUT + split tender
- `POST /hold-bills` → held sale; `POST /hold-bills/:id/resume` with payments → complete

Full request/response schemas: open Swagger at `/docs`.
