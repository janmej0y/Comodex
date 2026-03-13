# Comodex

Comodex is a full-stack commodities and inventory management workspace. It contains:

- a `Next.js 14` frontend for operations, analytics, and inventory workflows
- a `NestJS + GraphQL + Prisma` backend for authentication, products, dashboard metrics, and RBAC

The project is structured so the frontend can run either:

- against the real backend through `NEXT_PUBLIC_GRAPHQL_URL`
- or against the built-in Apollo mock layer for UI-only work

## Product Goal

Comodex is designed for commodity and stock management teams that need:

- product visibility
- inventory updates
- low-stock monitoring
- role-based access control
- an executive dashboard for managers

## Roles and Access Rules

There are two roles in the system:

### `MANAGER`

Allowed to:

- log in
- view all products
- add or edit products
- adjust stock
- view the dashboard

### `STORE_KEEPER`

Allowed to:

- log in
- view all products
- add or edit products
- adjust stock

Restricted from:

- dashboard access

Frontend route protection is handled in the UI layer, and backend resolver protection enforces the same rules server-side.

## Architecture

## High-Level Layout

```text
comodex/
├─ app/                  # Next.js App Router frontend
├─ components/           # Reusable UI and layout components
├─ lib/                  # Apollo client, auth context, theme, helpers
├─ types/                # Shared frontend types
├─ backend/              # NestJS GraphQL API + Prisma
│  ├─ prisma/            # Prisma schema and seed
│  └─ src/               # Modules, resolvers, guards, services
├─ package.json          # Frontend scripts
└─ README.md
```

## Frontend Architecture

Frontend stack:

- `Next.js 14` App Router
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Apollo Client`
- `Framer Motion`

Core frontend responsibilities:

- session handling and client-side role awareness
- protected navigation
- inventory management UI
- dashboard UI for managers
- form validation and user-safe error handling
- responsive layouts for desktop and mobile

Important frontend files:

- [app/page.tsx](c:/Users/Main/Desktop/Comodex/app/page.tsx): login screen
- [app/dashboard/page.tsx](c:/Users/Main/Desktop/Comodex/app/dashboard/page.tsx): manager dashboard
- [app/products/page.tsx](c:/Users/Main/Desktop/Comodex/app/products/page.tsx): products workspace
- [app/products/[id]/page.tsx](c:/Users/Main/Desktop/Comodex/app/products/[id]/page.tsx): product detail
- [components/ProtectedRoute.tsx](c:/Users/Main/Desktop/Comodex/components/ProtectedRoute.tsx): route guard
- [components/Sidebar.tsx](c:/Users/Main/Desktop/Comodex/components/Sidebar.tsx): role-driven navigation
- [lib/auth-context.tsx](c:/Users/Main/Desktop/Comodex/lib/auth-context.tsx): auth/session brain
- [lib/apollo-client.ts](c:/Users/Main/Desktop/Comodex/lib/apollo-client.ts): Apollo setup, mock link, auth header, error link
- [lib/graphql.ts](c:/Users/Main/Desktop/Comodex/lib/graphql.ts): GraphQL operations
- [lib/error-utils.ts](c:/Users/Main/Desktop/Comodex/lib/error-utils.ts): developer-safe and user-safe error normalization

## Backend Architecture

Backend stack:

- `NestJS`
- `GraphQL`
- `Prisma`
- `JWT` authentication
- `Passport`

Core backend responsibilities:

- user login
- JWT issuing
- current-user authentication
- role-based resolver protection
- product read/write operations
- dashboard aggregation for managers

Important backend files:

- [backend/src/app.module.ts](c:/Users/Main/Desktop/Comodex/backend/src/app.module.ts): root module
- [backend/src/main.ts](c:/Users/Main/Desktop/Comodex/backend/src/main.ts): bootstrap
- [backend/src/auth/auth.module.ts](c:/Users/Main/Desktop/Comodex/backend/src/auth/auth.module.ts): auth module
- [backend/src/auth/auth.resolver.ts](c:/Users/Main/Desktop/Comodex/backend/src/auth/auth.resolver.ts): login mutation
- [backend/src/auth/auth.service.ts](c:/Users/Main/Desktop/Comodex/backend/src/auth/auth.service.ts): token and login logic
- [backend/src/products/products.resolver.ts](c:/Users/Main/Desktop/Comodex/backend/src/products/products.resolver.ts): product queries/mutations
- [backend/src/products/products.service.ts](c:/Users/Main/Desktop/Comodex/backend/src/products/products.service.ts): product persistence logic
- [backend/src/dashboard/dashboard.resolver.ts](c:/Users/Main/Desktop/Comodex/backend/src/dashboard/dashboard.resolver.ts): manager-only metrics
- [backend/src/common/guards/gql-auth.guard.ts](c:/Users/Main/Desktop/Comodex/backend/src/common/guards/gql-auth.guard.ts): GraphQL auth guard
- [backend/src/common/guards/roles.guard.ts](c:/Users/Main/Desktop/Comodex/backend/src/common/guards/roles.guard.ts): RBAC guard
- [backend/prisma/schema.prisma](c:/Users/Main/Desktop/Comodex/backend/prisma/schema.prisma): data model
- [backend/prisma/seed.ts](c:/Users/Main/Desktop/Comodex/backend/prisma/seed.ts): sample users and products

## Authentication and RBAC Flow

### Frontend

1. User submits login form.
2. Apollo executes the login mutation.
3. Frontend stores the session token and role.
4. Sidebar and route access are derived from `user.role`.
5. Protected pages skip protected queries until auth bootstrap is complete.

### Backend

1. Login mutation validates credentials.
2. Backend signs a JWT containing user identity and role.
3. GraphQL auth guard extracts and verifies the token.
4. Roles guard enforces resolver-level access.

### Enforcement Model

- `dashboard` queries require `MANAGER`
- `products` queries and mutations allow both `MANAGER` and `STORE_KEEPER`

## Feature Summary

### Core implemented features

- login with role-based session
- protected routes
- manager dashboard
- products listing
- add/edit product flow
- stock adjustments
- mobile-friendly product cards
- light/dark theme
- toasts and interaction feedback
- user-facing and developer-facing error handling

### Extended frontend modules

The frontend also includes UI modules for future backend expansion:

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

These are frontend modules intended to be wired to additional backend domains later.

## Data and API Design

The frontend is already structured around GraphQL operations for:

- login
- product list
- product detail
- product upsert
- stock adjustment
- dashboard summary

This makes the UI portable between:

- the built-in mock GraphQL layer
- the real NestJS GraphQL backend

## Getting Started

## Prerequisites

- Node.js 18+
- npm

## 1. Install frontend dependencies

```bash
npm install
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Configure environment variables

### Root frontend `.env.local`

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

If this variable is omitted, the frontend uses the local mock Apollo backend instead.

### Backend `.env`

Example:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-in-real-environments"
PORT=4000
```

## 4. Prepare Prisma

From `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If `prisma migrate` is not usable in your environment, use:

```bash
npx prisma db push
npm run prisma:seed
```

## 5. Start backend

From `backend/`:

```bash
npm run start:dev
```

GraphQL endpoint:

```text
http://localhost:4000/graphql
```

## 6. Start frontend

From repo root:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Frontend Scripts

From repo root:

- `npm run dev`: start Next.js dev server
- `npm run build`: production build
- `npm run start`: start production server
- `npm run lint`: lint frontend

## Backend Scripts

From `backend/`:

- `npm run start`: start NestJS
- `npm run start:dev`: start NestJS in watch mode
- `npm run build`: compile backend
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: run development migration
- `npm run prisma:seed`: seed database

## Demo Usage

If you are using the mock frontend mode, the login page supports demo flows directly.

If you are using the real backend, seed users created by `backend/prisma/seed.ts` should be used. Check that file for the exact demo users and roles available in your local database.

## UI and UX Notes

The frontend is designed with:

- responsive desktop and mobile layouts
- touch-friendly actions in the products section
- optimistic interactions for faster inventory actions
- dark mode support using Tailwind `dark:` variants
- animation kept lightweight to avoid scroll jank

## Error Handling

### User-facing layer

- friendly error messages
- retry actions where useful
- reference IDs for support/debugging

### Developer-facing layer

- normalized error objects
- scoped error reporting
- Apollo GraphQL/network interception
- local browser diagnostics in `dev-error-log`

## Troubleshooting

## Unauthorized GraphQL errors in frontend

If the frontend points to the real backend and the session token is missing or expired:

- protected queries are skipped until auth is ready
- invalid sessions are cleared automatically
- user is redirected back to login

If you still see stale behavior in development, restart the dev server.

## Next.js chunk error

If you hit an error like:

```text
Cannot find module './682.js'
```

Clear the Next.js build cache:

```bash
node -e "const fs=require('fs'); fs.rmSync('.next',{recursive:true,force:true})"
npm run dev
```

## Git and environment files

The project ignores environment files via `.gitignore`. If a secret file was committed before that rule existed, remove it from git tracking explicitly.

## Suggested Next Steps

To take this to production quality, the next logical backend/frontend upgrades are:

1. replace local token storage with secure HTTP-only cookie auth
2. add refresh token flow
3. add request validation DTOs consistently across all modules
4. add automated tests for frontend and backend
5. add warehouse, alerts, and analytics backend modules to match the frontend feature surface
6. move from SQLite dev setup to PostgreSQL for shared environments

## License

Private project workspace.
