# Kundu Electronics

A responsive electronics-components storefront for **Kundu Electronics, Khulna, Bangladesh**. The project is built as a Next.js modular monolith with Supabase for PostgreSQL, authentication and product-image storage.

> **Launch status — 15 November 2026:** the storefront and backend foundation are implemented, but a live store has not yet been verified. Supabase is not connected, the database migration has not been applied, the published catalogue is empty, and checkout is disabled until owner-approved delivery and payment settings are configured.

## What is implemented

- Responsive storefront pages: home, shop, product details, cart, about, contact, support and shipping/returns.
- Database-backed catalogue search, one-character search, category and price filters, sorting and bounded pagination.
- Product options and server-loaded variant price overrides. Variants share product-level inventory in this release.
- Persistent browser cart. The browser cart is not authoritative for price or stock.
- Supabase browser/server/public/admin client boundaries and the Next.js 16 Proxy for auth-cookie refresh.
- Protected admin foundations for products, categories, images, inventory, orders, payment verification and store settings.
- Server-side checkout and guest-order routes with validation, idempotency, rate limiting and database-derived totals.
- Manual bKash/Nagad payment submission and staff verification flow. A submitted transaction reference remains pending until an authorized person verifies it.
- PostgreSQL migration for catalogue, inventory, orders, payment records, audit events, RLS and private image storage.
- Unit tests for catalogue parsing/search, cart behaviour, checkout validation/security, payment configuration and order summaries.

These are implemented code paths, not proof of a working production integration. Database, auth, storage, checkout and payment behaviour must pass staging tests before being enabled for customers.

## Current launch blockers

| Area | Current state |
|---|---|
| Supabase | No connected project is verified |
| Database | Migration exists at **supabase/migrations/0001_initial_schema.sql**; it has not been applied to a verified project |
| Product data | The public catalogue is intentionally empty; candidate records still need owner approval |
| Admin | Routes and authorization code exist; real Supabase auth and role provisioning are unverified |
| Delivery | No approved delivery zones or charges are configured |
| Payments | bKash and Nagad are disabled by default; receiving details and instructions are not configured |
| Checkout | Guarded off until the backend, delivery and payment prerequisites are present |
| Production hosting/domain | Deployment and domain configuration have not been verified in this repository review |

See [the 48-hour launch plan](documentation/LAUNCH_PLAN_48_HOURS.md) for the exact release sequence and fallback.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript with strict checking
- Tailwind CSS 4
- Supabase PostgreSQL, Auth and Storage
- Node.js and npm

The committed package lockfile is on the feature branch. Use **npm ci** for reproducible installs. The GitHub Actions workflow uses Node 24; the owner’s documented Windows environment also uses Node 24.

## Run locally

Prerequisites: Node.js 24 and npm. From the repository root:

~~~powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
~~~

Open http://localhost:3000.

Edit .env.local and set the values from .env.example when a Supabase project is available:

| Variable | Purpose | Exposure |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Public |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase publishable key | Public |
| SUPABASE_SECRET_KEY | Privileged server-side Supabase key | Server only |
| APP_HMAC_SECRET | HMAC key for checkout access/idempotency and rate-limit identifiers | Server only |
| NEXT_PUBLIC_SITE_URL | Canonical public site origin | Public |

Generate APP_HMAC_SECRET locally with:

~~~powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
~~~

Do not commit .env.local. Never put SUPABASE_SECRET_KEY or APP_HMAC_SECRET in a NEXT_PUBLIC_ variable, browser code, screenshots, issues or chat. The application deliberately renders an unconfigured/empty state rather than inventing products or pretending checkout works when Supabase is absent.

## Verification commands

Run all of these on the same commit before deployment:

~~~powershell
npm run typecheck
npm run lint
npm test
npm run build
npm audit
~~~

The latest documented unit-test run reported 42 passing tests, but full Windows typecheck, lint, production build, fresh dependency audit and database/browser integration checks still need to be run against the current branch. See [TEST_REPORT](documentation/TEST_REPORT.md).

The GitHub Actions workflow at .github/workflows/windows-ci.yml runs install, typecheck, lint, unit tests and production build on Node 24. The separate audit job reports dependency findings without silently upgrading packages.

## Deployment overview

Vercel is the recommended first deployment target for this Next.js application. Use a Preview deployment from the reviewed feature branch before production. Do not deploy the older main branch blindly: as of this review, main and feat/storefront-foundation have diverged.

Production requires all of the following:

1. A reviewed Supabase migration applied to the intended project, with RLS and storage access tested.
2. The four Supabase/HMAC environment variables above, plus NEXT_PUBLIC_SITE_URL, configured in the hosting provider’s environment settings.
3. A provisioned admin account and verified protected-route behaviour.
4. Owner-approved product names, selling prices, availability, descriptions and images.
5. Owner-approved delivery zones/charges and manual payment receiving details/instructions.
6. Successful end-to-end order, payment-pending and admin-verification tests.

For a catalogue/contact soft launch, checkout may remain disabled. Do not advertise online ordering or accept transfers until the full checkout gate passes.

Useful official references:
- [Deploying Next.js](https://nextjs.org/docs/app/getting-started/deploying)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environments](https://vercel.com/docs/deployments/environments)
- [Supabase SSR with Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [Supabase deployment and environments](https://supabase.com/docs/guides/deployment)

## Repository guide

| Path | Purpose |
|---|---|
| src/app | Pages and API route handlers |
| src/components | Storefront, cart, search and order UI |
| src/config/business.ts | Customer-facing business details and defaults |
| src/data | Public catalogue fallback and Supabase-backed storefront queries |
| src/lib | Cart, catalogue, checkout, order, security and Supabase helpers |
| supabase/migrations | Database schema, functions, policies and grants |
| supabase/tests | pgTAP security-contract tests |
| documentation/ | Project status, decisions, testing, import guidance and launch plan |
| documentation/research/ | Preserved SparkFun research and design reference |

## Project documentation

Start with [START_HERE](START_HERE.md), then read:

1. [Project state](documentation/PROJECT_STATE.md)
2. [48-hour launch plan](documentation/LAUNCH_PLAN_48_HOURS.md)
3. [Task tracker](documentation/TASK_TRACKER.md)
4. [Issues and limitations](documentation/ISSUES_AND_LIMITATIONS.md)
5. [Product data import rules](documentation/PRODUCT_DATA_IMPORT.md)
6. [Test report](documentation/TEST_REPORT.md)
7. [Research index](documentation/research/README.md)

## Business-data and security rules

- Publish selling prices only. Never expose purchase costs, suppliers, margins or private inventory notes.
- Do not invent stock, specifications, photos, opening hours, delivery charges, delivery promises, warranty or return conditions.
- Keep candidate products in draft until their public details are verified and approved.
- Keep bKash/Nagad disabled until the owner confirms the receiving number and exact customer instructions.
- A transaction reference is not proof of payment. Only an authorized staff member may verify it.
- Keep credentials, customer records and raw internal business documents out of Git.
