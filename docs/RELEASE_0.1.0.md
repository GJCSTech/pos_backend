# Backend Release 0.1.0

**Date:** 2026-07-19  
**Codename:** Foundation

## Delivered

- Clean Architecture Express API (Node.js 22)
- PostgreSQL 16 + Prisma schema/migration for Company, Branch, User, Role, Permission, Device
- JWT access + refresh token auth with RBAC middleware
- Device registration API
- Health check, Winston daily logs, Swagger UI
- Docker / Compose production + development overlays
- Jest unit tests for auth, health, crypto helpers

## Upgrade / install

See [../README.md](../README.md).

## Next (planned)

- Sync protocol (push/pull, conflict resolution)
- Business entity replication (products, sales, inventory)
- Mobile sync client integration
