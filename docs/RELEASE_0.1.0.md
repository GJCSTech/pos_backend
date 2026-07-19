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

## Next

Delivered in [RELEASE_0.2.0.md](./RELEASE_0.2.0.md) (Enterprise Business Core). Sync protocol remains planned.
