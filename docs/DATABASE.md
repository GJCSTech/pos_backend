# Database — Foundation + Business Core

PostgreSQL 16 via Prisma. Migration directory: `prisma/migrations/`.

## Tables (0.1.0 foundation)

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

## Tables (0.2.0 business core)

| Table | Purpose |
|-------|---------|
| `product_categories` | Category hierarchy |
| `product_attributes` | Attribute definitions |
| `units` | UOM master |
| `tax_masters` | GST / tax rates |
| `suppliers` | Supplier master |
| `customer_groups` | Customer pricing groups |
| `customers` | Walk-in / retail / wholesale customers |
| `products` | Product master (SKU, barcode, prices, stock flags) |
| `product_variants` | Variant SKUs and prices |
| `product_units` | Multi-unit conversions / barcodes |
| `inventories` | On-hand stock by branch + stock key |
| `stock_movements` | Immutable stock ledger |
| `opening_stocks` | Opening stock documents |
| `purchases` / `purchase_items` | Purchase invoices |
| `purchase_returns` | Purchase returns |
| `sales` / `sale_items` | POS sales |
| `hold_bills` | Held checkout bills |
| `payments` | Sale / purchase payments |
| `business_settings` | Key/value branch settings |
| `receipt_settings` | Receipt print configuration |

## Common columns

Every business table includes:

| Column | Notes |
|--------|-------|
| `id` | UUID PK |
| `company_id` | Tenant scope |
| `branch_id` | Branch scope |
| `created_at` / `updated_at` | Timestamptz |
| `deleted_at` | Soft delete |
| `version` | Increment on mutation |
| `created_by` / `updated_by` | Actor UUID |

## Inventory stock key

`inventories.stock_key` uniquely identifies a stock bucket as:

`productId|variantId|batchNumber|serialNumber`
