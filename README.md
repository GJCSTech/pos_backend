# VJ Garden POS Backend

Centralized **Node.js 22 / Express / PostgreSQL 16 / Prisma** API for the VJ Garden Boutique offline-first POS platform.

Version **0.2.0** delivers the enterprise business core (catalog, parties, inventory, purchases, sales, payments, settings) on top of the **0.1.0** multi-tenant foundation. SQLite ↔ PostgreSQL sync remains planned for a later release.

## Stack

| Concern | Technology |
|---------|------------|
| Runtime | Node.js 22 LTS |
| Framework | Express |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | JWT access + refresh tokens |
| Validation | Zod |
| Logging | Winston + daily rotate |
| Docs | Swagger / OpenAPI 3 |
| Tests | Jest |
| Containers | Docker + Compose |

## Architecture

Clean Architecture with DI-friendly wiring:

```
Controllers → Services → Repositories → Prisma → PostgreSQL
```

Cross-cutting middleware: Helmet, CORS, compression, rate limiting, authentication, authorization, Zod validation, request logging, centralized error handling.

## Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop (recommended for PostgreSQL)
- Git

## Quick start (Docker)

```bash
cd backend
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API: `http://localhost:3000/api/v1`  
Swagger UI: `http://localhost:3000/docs`

### Full stack Compose

```bash
cp .env.example .env
docker compose up --build
```

Development hot-reload overlay:

```bash
npm run docker:dev
```

## Local development (without API container)

1. Start PostgreSQL:

```bash
docker compose up -d postgres
```

2. Configure environment:

```bash
cp .env.example .env
# Edit JWT secrets before any non-local deployment
```

3. Install and migrate:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

4. Run API:

```bash
npm run dev
```

## Seed credentials (development only)

| Field | Value |
|-------|-------|
| Company code | `VJGARDEN` |
| Username | `admin` |
| Email | `admin@vjgarden.local` (or `SEED_ADMIN_EMAIL`) |
| Password | `ChangeMeAdmin!2026` (or `SEED_ADMIN_PASSWORD`) |

**Never** ship these defaults to production. Rotate JWT secrets and admin password before go-live.

## API surface (0.2.0)

Foundation (unchanged from 0.1.0):

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | No | Liveness + DB check |
| `POST` | `/api/v1/auth/login` | No | Issue access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | No | Rotate tokens |
| `POST` | `/api/v1/auth/logout` | No | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Bearer | Current user |
| `POST` | `/api/v1/devices/register` | Bearer + `device.register` | Register POS device |
| `GET` | `/api/v1/devices` | Bearer + `device.view` | List devices |
| `GET` | `/api/v1/devices/:id` | Bearer + `device.view` | Device detail |

Business core (CRUD + workflows; see Swagger for full query params):

| Area | Base paths |
|------|------------|
| Catalog | `/product-categories`, `/product-attributes`, `/units`, `/tax-masters`, `/products`, `/product-variants` |
| Parties | `/suppliers`, `/customers`, `/customer-groups` |
| Inventory | `/inventories`, `/inventories/value`, `/inventories/low-stock`, `/inventories/adjust`, `/stock-movements`, `/opening-stocks` |
| Purchases | `/purchases`, `/purchases/:id/receive`, `/purchase-returns`, `/purchase-returns/:id/complete` |
| Sales | `/sales`, `/sales/:id/complete`, `/hold-bills`, `/hold-bills/:id/resume`, `/payments` |
| Settings | `/business-settings`, `/receipt-settings` |

List endpoints support `page`, `pageSize`, `search`, `sortBy`, `sortOrder`, and often `branchId` / `isActive`.

### Login example

```bash
curl -s http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "usernameOrEmail": "admin",
    "password": "ChangeMeAdmin!2026",
    "companyCode": "VJGARDEN"
  }'
```

### Device registration example

```bash
curl -s http://localhost:3000/api/v1/devices/register \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "deviceUuid": "11111111-1111-4111-8111-111111111111",
    "platform": "ANDROID",
    "deviceName": "Counter Tablet 1",
    "appVersion": "0.22.0"
  }'
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | TypeScript watch server |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest unit tests |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:migrate:deploy` | Apply migrations (prod) |
| `npm run db:seed` | Seed foundation data |

## Project layout

```
backend/
├── docker/                 # Dev Dockerfile, Postgres init
├── docs/                   # Backend-specific docs
├── prisma/                 # Schema, migrations, seed
├── src/
│   ├── config/             # Env (Zod)
│   ├── container/          # DI composition root
│   ├── controllers/
│   ├── database/
│   ├── errors/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── swagger/
│   ├── types/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── index.ts
└── tests/
```

## Common columns

Every business table includes multi-tenant / audit / sync-ready columns:

`id`, `companyId`, `branchId`, `createdAt`, `updatedAt`, `deletedAt`, `version`, `createdBy`, `updatedBy`

`version` and soft-delete (`deletedAt`) support future conflict detection during offline sync.

## Production checklist

- [ ] Set strong unique `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- [ ] Change seed admin password or disable seed in production
- [ ] Restrict `CORS_ORIGIN`
- [ ] Use managed PostgreSQL with TLS
- [ ] Persist `logs/` or ship to a log aggregator
- [ ] Run `prisma migrate deploy` on release
- [ ] Configure reverse proxy (TLS termination)

## Related repository docs

- Platform architecture: `../docs/02_ARCHITECTURE.md`
- Permissions: `../docs/13_PERMISSIONS.md`
- ADR: `../docs/10_DECISIONS.md` (ADR-032)
- Backend detail: `./docs/`

## License

UNLICENSED — proprietary to GJCSTech / VJ Garden Boutique.
