# Comodex Backend (NestJS + GraphQL + Prisma)

## Stack
- NestJS
- GraphQL (code-first)
- Prisma
- JWT auth (Passport)
- SQLite (default for local dev)

## RBAC Rules Implemented
- Roles:
  - `MANAGER`
  - `STORE_KEEPER`
- Access:
  - Both roles can login
  - Both roles can query products and create/update/adjust products
  - Only `MANAGER` can access `dashboardStats`

## GraphQL Operations Implemented
- `login(input: LoginInput!): AuthPayload!`
- `products: [Product!]!`
- `product(id: String!): Product`
- `productMovements(productId: String!): [ProductMovement!]!`
- `productTrend(productId: String!): [ProductTrendPoint!]!`
- `upsertProduct(input: UpsertProductInput!): Product!`
- `adjustStock(input: AdjustStockInput!): Product!`
- `dashboardStats: DashboardStats!` (Manager only)

## Setup (Step by Step)
From project root:

```bash
cd backend
npm install
```

### 1) Generate Prisma client
```bash
npm run prisma:generate
```

### 2) Create database schema
Preferred:
```bash
npm run prisma:migrate
```

If your machine has migrate engine issues, fallback:
```bash
npx prisma db push
```

### 3) Seed demo data
```bash
npm run prisma:seed
```

### 4) Run backend
```bash
npm run start:dev
```

GraphQL endpoint:
- `http://localhost:4000/graphql`

## Demo Users
- `manager@comodex.io` / `password123` / role `MANAGER`
- `storekeeper@comodex.io` / `password123` / role `STORE_KEEPER`

## Connect Frontend to Backend
In project root `.env.local` (frontend):

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

Frontend Apollo client is already wired to:
- use real backend when `NEXT_PUBLIC_GRAPHQL_URL` is set
- fallback to mock backend when not set

## Build
```bash
npm run build
```

## Notes
- Default DB: SQLite (`backend/prisma/dev.db`)
- JWT settings in `backend/.env`
- For production, switch Prisma datasource to PostgreSQL and set secure JWT secret.