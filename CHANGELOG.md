# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-07-19

### Added

- Standardized API envelopes with top-level `message` and failure `errors`
- UUID path-parameter validation on all resource `:id` routes
- List query sync filters: `updatedSince`, `createdFrom`, `createdTo`
- Pagination meta flags `hasNext` / `hasPrev`
- Prisma known-error mapping (unique conflict, FK, not found) in the central error handler
- Purchase-return remaining-quantity validation on complete
- Optimistic concurrency checks on inventory quantity updates
- `(companyId, updatedAt)` indexes for products, inventories, suppliers, customers, purchases, sales
- Swagger 0.2.1 envelope schemas, shared error responses, and request/response examples
- Unit tests for API envelope, pagination/sync filters, sale/hold validation, purchase-return caps
- Release notes: `docs/RELEASE_0.2.1.md`

### Changed

- Package version bumped to `0.2.1`
- Product / product-variant deletes return `200` + envelope (removed bare `204`)
- Low-stock listing is paginated
- Inventory valuation and hold-bill resume responses use named `data` keys
- Stronger Zod validation for sales, purchases, hold bills, and stock adjustments
- README, `docs/API.md`, and `docs/ARCHITECTURE.md` updated for mobile integration

### Fixed

- Invalid JSON bodies and invalid UUIDs now return `400` instead of unhandled `500`s
- Rate-limit responses aligned to the standard failure envelope

## [0.2.0] - 2026-07-19

### Added

- Enterprise business schema and migration for catalog, parties, inventory, purchase, sales, payments, and settings
- REST APIs with pagination, filtering, sorting, and search for all Release 0.2.0 modules
- Inventory valuation, low-stock listing, stock adjustments, stock movements, and opening stock posting
- Purchase workflow with line items, taxes, discounts, receive-to-stock, and purchase returns
- Sales workflow with line items, GST calculation, split payments (Cash/Card/UPI/Credit), and hold bills
- Business settings and receipt settings APIs
- RBAC permissions for catalog, supplier, customer, inventory, purchase, sales, and settings
- Swagger documentation for business endpoints
- Jest unit tests for catalog, inventory, sales validation, and money helpers

### Changed

- Package version bumped to `0.2.0`
- Seed roles updated with business-core permissions

## [0.1.0] - 2026-07-19

### Added

- Foundation API: auth, devices, health
- Company / Branch / User / Role / Permission / Device schema
- JWT access + refresh authentication with RBAC
- Docker Compose, Swagger UI, Winston logging, Jest unit tests
