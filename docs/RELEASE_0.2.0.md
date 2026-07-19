# Backend Release 0.2.0

**Date:** 2026-07-19  
**Codename:** Enterprise Business Core  
**Tag:** `v0.2.0`

## Delivered

- Prisma models + migration for product catalog, units, tax, suppliers, customers, inventory, purchases, sales, payments, and settings
- Repository → Service → Controller layers for all business modules
- CRUD APIs with pagination / filtering / sorting / search
- Inventory movements, opening stock posting, valuation, and low-stock queries
- Purchase receive and purchase return stock effects (transactions)
- Sales completion with split payments and hold-bill resume/cancel
- Swagger coverage for business endpoints
- Seeded RBAC permissions for STORE_ADMIN and SALES_USER

## Explicitly out of scope

- Sync engine (SQLite ↔ PostgreSQL)
- WooCommerce integration
- Reporting module
- Admin portal

## Upgrade

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run build
npm test
```

## Next (planned)

- Offline sync protocol (push/pull, conflict resolution)
- Device sync sessions and change feeds
- Reporting / analytics APIs
