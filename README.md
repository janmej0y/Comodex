# Comodex

<div align="center">

## 📦 Executive Commodities Management System

Premium inventory operations platform built with Next.js, NestJS, GraphQL, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Apollo GraphQL](https://img.shields.io/badge/Apollo_GraphQL-Client-311C87?style=for-the-badge&logo=apollographql&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

## ✨ Overview

Comodex is a full-stack commodities and inventory management system designed for operational teams that need:

- secure authentication and role-based access
- live inventory visibility across warehouses
- product management and stock adjustments
- procurement workflows and goods receipt tracking
- audit-ready stock movement history
- manager-only dashboards and analytics

The project includes:

- a **Next.js 14** frontend with a premium, responsive UI
- a **NestJS + GraphQL + Prisma** backend
- a **PostgreSQL** data model for warehouse operations
- a **mock Apollo mode** so the frontend can still run without the backend

## 🧩 Roles and Access

There are two roles in the system:

### `MANAGER`

Can:

- sign up and sign in
- view all products
- add and edit products
- upload optional product images
- adjust stock
- view dashboard and analytics
- access manager workflows like warehouse control, procurement, alerts, and audit surfaces

### `STORE_KEEPER`

Can:

- sign up and sign in
- view all products
- add and edit products
- upload optional product images
- adjust stock

Cannot:

- access the dashboard
- access manager-only analytics surfaces

RBAC is enforced at two levels:

- frontend route and menu gating
- backend JWT and role guards

## 🛠️ Tech Stack

### Frontend

- `Next.js 14` App Router
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Apollo Client`
- `Framer Motion`
- `Lucide React`

### Backend

- `NestJS`
- `GraphQL`
- `Prisma ORM`
- `PostgreSQL`
- `JWT`
- `Passport`
- `class-validator`
- `bcryptjs`

## 🏗️ Architecture

```text
Comodex/
├─ app/                    # Next.js App Router pages
├─ components/             # Shared UI, layout, guards, modals, tables
├─ lib/                    # Apollo, auth, theme, helpers, telemetry, errors
├─ public/                 # Static assets and sample product media
├─ tests/                  # Frontend smoke tests
├─ types/                  # Frontend domain types
├─ backend/
│  ├─ prisma/              # Prisma schema, migrations, seed
│  ├─ src/
│  │  ├─ auth/             # Signup, login, refresh, logout
│  │  ├─ products/         # Products, balances, stock transfers, trend
│  │  ├─ dashboard/        # Manager dashboard aggregation
│  │  ├─ procurement/      # Purchase orders and goods receipts
│  │  ├─ alerts/           # Alert rules and low-stock alerts
│  │  ├─ audit/            # Audit trail
│  │  ├─ common/           # Guards, decorators, RBAC helpers
│  │  └─ prisma/           # Prisma service
│  └─ test/                # Backend smoke tests
└─ README.md
```

## 🚀 Implemented Features

### Authentication and Security

- signup-first flow for managers and store keepers
- email/password login
- JWT access token + refresh token flow
- role-based protected routes
- role-based menu visibility
- role-based button and action restriction

### Inventory and Warehousing

- product list and product detail views
- add/edit product modal
- optional product image upload with preview
- stock adjustment actions
- multi-warehouse stock balances
- inter-warehouse stock transfers
- real stock ledger entries
- warehouse performance summaries

### Procurement and Monitoring

- purchase order creation
- goods receipt posting
- low-stock alerts engine
- audit trail page
- manager dashboard with aggregated analytics

### UX and Frontend Quality

- premium light UI by default
- optional persistent dark mode
- command-palette style global search
- mobile bottom navigation
- responsive sidebar and mobile menu
- loading states, toasts, and safe error messages
- developer-focused error normalization and tracing

## 📸 Product Image Upload

Products now support optional image upload.

Current behavior:

- the add/edit product modal includes an **Upload Image** action
- image upload is optional
- users can upload a file or paste a direct image URL
- the selected image is previewed before save
- the product detail page shows the uploaded image first
- if no image exists, the app falls back to sample product artwork

Current storage strategy:

- prototype mode stores uploaded images as `imageUrl`
- for production, move image storage to a proper object store such as S3 or Cloudinary and persist only the remote URL

## 🔌 API Surface

### GraphQL

Main frontend operations live in `lib/graphql.ts`.

Auth:

- `signup`
- `login`
- `refreshSession`
- `logout`

Dashboard:

- `dashboardStats`

Products and inventory:

- `products`
- `product(id)`
- `upsertProduct`
- `adjustStock`
- `transferStock`
- `productMovements`
- `productTrend`
- `warehouses`
- `stockTransfers`

Procurement:

- `purchaseOrders`
- `goodsReceipts`
- `createPurchaseOrder`
- `receivePurchaseOrder`

Alerts and audit:

- `alertRules`
- `lowStockAlerts`
- `saveAlertRule`
- `auditTrail`

### REST

The Nest backend also exposes REST endpoints for core auth and product operations:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /products`
- `POST /products`
- `PUT /products/:id`
- `POST /products/:id/adjust`

## 🧠 Data Model

The Prisma schema includes these core entities:

- `User`
- `RefreshToken`
- `Warehouse`
- `Product`
- `InventoryBalance`
- `StockLedger`
- `StockTransfer`
- `PurchaseOrder`
- `PurchaseOrderLine`
- `GoodsReceipt`
- `GoodsReceiptLine`
- `AlertRule`
- `AuditEvent`

## 🖥️ Frontend Routes

Primary app surfaces:

- `/` login and signup
- `/dashboard`
- `/products`
- `/products/[id]`
- `/warehouses`
- `/operations`
- `/alerts`
- `/forecast`
- `/audit`
- `/media`
- `/scan`
- `/permissions`
- `/localization`
- `/collaboration`
- `/analytics`
- `/integrations`
- `/release-controls`
- `/quality`
- `/pwa`
- `/design-system`

## ⚙️ Local Setup

### Prerequisites

- `Node.js 18+`
- `npm`
- `PostgreSQL`

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

## 🔐 Environment Variables

### Root `.env.local`

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_APP_ENV=development
```

If `NEXT_PUBLIC_GRAPHQL_URL` is not set, the frontend uses the built-in Apollo mock layer.

### `backend/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/commodex?schema=public"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_DAYS="14"
PORT=4000
NODE_ENV="development"
```

### 3. Generate Prisma client

```bash
cd backend
npm run prisma:generate
```

### 4. Sync database schema

Preferred for managed environments with an existing database baseline:

```bash
npm run prisma:push
```

If you are using a clean migration-managed environment:

```bash
npm run prisma:deploy
```

### 5. Seed demo data

```bash
npm run prisma:seed
```

### 6. Start backend

```bash
npm run start:dev
```

Backend GraphQL endpoint:

```text
http://localhost:4000/graphql
```

### 7. Start frontend

From the repo root:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## 👥 Demo Accounts

Seeded accounts created by `backend/prisma/seed.ts`:

| Role | Email | Password |
| --- | --- | --- |
| Manager | `manager@comodex.io` | `password123` |
| Store Keeper | `storekeeper@comodex.io` | `password123` |

You can also register new users from the signup page.

## 📜 Scripts

### Root

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

### Backend

```bash
cd backend
npm run start
npm run start:dev
npm run start:prod
npm run build
npm test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:push
npm run prisma:seed
```

## 🧪 Testing

Current automated coverage:

### Frontend

```bash
npm test
```

### Backend

```bash
cd backend
npm test
```

Recommended next upgrades:

- unit tests for auth, guards, and services
- GraphQL integration tests
- Playwright e2e flows
- visual regression testing

## 📱 Responsive Design Notes

The UI is designed to work across mobile, tablet, laptop, and large desktop screens.

Current responsive strategy includes:

- mobile menu + scrollable bottom navigation
- responsive page headers and action groups
- mobile-first product cards
- responsive dashboards and warehouse cards
- touch-friendly buttons and controls
- command-palette search overlay optimized for small screens
- full-width mobile forms and actions where needed

## ⚠️ Error Handling

Comodex uses two layers of error handling.

### User-facing

- safe error messages
- retry actions where relevant
- reference IDs for support

### Developer-facing

- normalized error objects
- Apollo GraphQL and network interception
- structured browser-side diagnostics
- local `dev-error-log` tracking

## ☁️ Deployment

### Frontend

Deploy on Vercel and set:

```env
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-url/graphql
```

### Backend

Deploy on Render or another Node host.

Recommended settings for a non-shell workflow:

Root directory:

```text
backend
```

Build command:

```bash
npm install --include=dev && npm run prisma:generate && npm run prisma:push && npm run build
```

Start command:

```bash
npm run start:prod
```

This setup avoids Render Shell and works with a pre-existing PostgreSQL schema.

## 🛠️ Troubleshooting

### `Product.imageUrl does not exist`

Your database schema is behind the code.

Fix:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### `nest: not found`

Your deploy environment is not installing dev dependencies.

Use this build command:

```bash
npm install --include=dev && npm run prisma:generate && npm run prisma:push && npm run build
```

### `P3005 The database schema is not empty`

This means Prisma migrate is trying to manage a database that already contains tables.

Use:

```bash
npm run prisma:push
```

instead of `npm run prisma:deploy` for that environment.

### Next.js stale chunk error

If you see errors like:

```text
Cannot find module './682.js'
```

Clear the cache and rerun:

```bash
node -e "const fs=require('fs'); fs.rmSync('.next',{recursive:true,force:true})"
npm run dev
```

## 🔭 Recommended Next Steps

1. move product image upload to object storage
2. switch auth to HTTP-only cookies for stronger session security
3. add integration and e2e test coverage
4. add CI/CD build, test, and schema checks
5. add API-level pagination and filtering for large inventories
6. add monitoring and structured production logging

## 📄 License

Private project workspace.
