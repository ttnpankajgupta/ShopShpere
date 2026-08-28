# ShopSphere

Multi-platform e-commerce foundation monorepo.

## Structure

| Path | Platform |
|------|----------|
| `backend/` | NestJS API + Prisma + Redis |
| `customer-portal/` | React Native (Expo) — iOS, Android, Web |
| `admin-portal/` | React admin application |
| `packages/contracts/` | Shared API contract types |
| `docs/Sprints/` | Sprint planning documents (S0–S24) |

## Quick start

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL + Redis)

### 1. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev
```

API: `http://localhost:3000`  
Health: `GET /api/v1/health`  
Ready: `GET /api/v1/ready`  
OpenAPI: `http://localhost:3000/api/docs`

### 3. Admin portal

```bash
cd admin-portal
cp .env.example .env
npm install
npm run dev
```

### 4. Customer portal

```bash
cd customer-portal
npm install
npm run web
```

## Sprint S0 scope

Foundation only — no business features. See `TASK_LEDGER.md` and `docs/contracts/s0-api-contract.md`.

## Engineering order

contract → database → backend → customer/admin → integration → tests → acceptance
