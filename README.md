# Kundu Electronics

A responsive electronics-components storefront for Kundu Electronics, Khulna, Bangladesh.

## Technology

- Next.js 16 App Router
- React 19.3
- TypeScript (strict)
- Tailwind CSS 4 plus a small, explicit design-token layer in `src/app/globals.css`
- Supabase Postgres/Auth is the planned production backend; no Supabase project or credentials are connected yet

## Current state

The repository is initialized locally. The initial foundation includes the application shell, responsive home/shop pages, public-safe business configuration, an empty verified catalogue, product-search/filter utilities and a first Supabase schema migration. The catalogue intentionally contains zero published products until owner-provided inventory and selling prices are reviewed.

## Requirements

- Node.js 22.6+ (Node 22 LTS recommended)
- npm

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The current environment could not reach the npm registry, so dependencies have not yet been installed and a production build has not been claimed as passing. Install them on a network-enabled machine before running the checks below.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Data rules

- `src/config/business.ts` is the public-safe business configuration. Do not place secrets or private inventory data there.
- `src/data/catalogue.ts` is the current public catalogue source and intentionally exports empty arrays.
- `src/lib/catalog/types.ts` defines the public product shape. It has no supplier cost / buying price field.
- `supabase/migrations/0001_initial_schema.sql` is a proposed schema migration and has not been applied to a Supabase project.
- Payment receiving numbers are unset. bKash/Nagad must stay disabled until the owner supplies confirmed receiving numbers.
- Orders must be created and validated server-side; submitted transaction references are not payment verification.

## Repository connection

The local Git repository has `main` as the initial documentation baseline and `feat/storefront-foundation` as the active implementation branch. A remote GitHub repository has not been created because the connected GitHub tools do not expose a repository-creation operation. Create a private repository named `kundu-electronics`, then add it as `origin` and push both branches. See `START_HERE.md`.

## Documentation

Start with [`START_HERE.md`](START_HERE.md), then `documentation/PROJECT_STATE.md`. SparkFun reference research is preserved unchanged in `documentation/research/`.
