# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
