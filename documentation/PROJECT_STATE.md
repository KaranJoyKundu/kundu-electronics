# PROJECT_STATE — Kundu Electronics

**Last updated:** 13 November 2026 (Asia/Dhaka)
**Active branch:** `feat/storefront-foundation`
**Local HEAD:** `c38f358` (`feat: add secure commerce backend foundation`), based on `f3ae4bce86b6f1050b4ce65f8181ca4fb604f16f`
**GitHub repository:** `KaranJoyKundu/kundu-electronics` (private; admin/push permission verified)
**Remote branch heads last verified:** `main=d88339395e6a1e34f9da904650efd1421480cf00`, `feat/storefront-foundation=f3ae4bce86b6f1050b4ce65f8181ca4fb604f16f`

## Objective

Deliver a production-capable Kundu Electronics electronics-components store in Khulna, Bangladesh. Prices are BDT (৳). SparkFun informs information architecture and shopping patterns; use original Kundu branding and assets only.

## Architecture

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Modular monolith; Supabase PostgreSQL/Auth/Storage integration.
- Browser and server Supabase clients are separated; service/secret client is server-only.
- Next.js 16 `src/proxy.ts` refreshes auth cookies.
- Public business settings live in `src/config/business.ts`.
- Public products contain selling prices only; no buying-cost property exists in the public `Product` type.
- Public catalogue data source is Supabase views/RPC; live catalogue intentionally empty pending owner-reviewed import.
- Money is whole BDT integer (`BIGINT` in SQL); no floating-point arithmetic for order totals.

## Repository recovery and preservation

The original project was not available when the replacement was initialized, and the owner explicitly authorized the replacement. The correct GitHub account is `KaranJoyKundu`. Repository `KaranJoyKundu/kundu-electronics` is private and accessible to the connected integration. Do not use the similarly named but unrelated `k-j-kundu/kundu-electronics` repository.

The local feature branch contains commit `c38f358` on top of `f3ae4bc`; the worktree is clean after a local commit. Its local `origin` points to `/mnt/data/kundu-electronics.gitbundle`, not GitHub. The GitHub feature head was last verified as `f3ae4bc`; the local update has not been pushed because DNS resolution for `github.com` failed from this runtime. An updated Git bundle is supplied for import into the owner Windows clone. Fetch GitHub before push, verify it has not advanced, then push normally without force. Keep `main` stable.

## Implemented in current local feature commit `c38f358`

- Fixed public business configuration with owner-provided phone, email, address, Facebook page, tagline and consultation note. Opening hours remain null.
- Product/variant catalogue types, database-backed search and server-side listing pagination (24 products/page), category, inclusive price filters, sorting, one-character search.
- Cart API fetches only product IDs in the cart; homepage query is limited; cart prices resolve from current product/variant records.
- Product page purchase selector supports active variants and price overrides. Variants share product-level inventory.
- Supabase server/browser/public/admin client separation, auth proxy, admin role checks and protected route groups.
- API route handlers for catalogue search/list/cart, order creation, order status and payment submissions.
- Admin pages/actions for products, categories, variants, images, inventory, orders, payment review and settings.
- Product-image storage is private; published image reads and staff previews are separately policy-controlled. Admin image upload validates JPEG/PNG/WebP/AVIF magic bytes and size; primary image selection is an atomic audited RPC.
- PostgreSQL migration covers 20 core tables, public-safe views/search, order/item snapshots, stock tracking/reservations/movements, payment submissions and history, audit events, rate limiting, RLS and private Storage buckets.
- Checkout function computes prices and delivery server-side, locks product/inventory rows, snapshots items, supports idempotency and does not trust browser prices.
- Manual payment state remains `pending_verification` until authorized staff verify/reject; verification and cancellation lock the order to avoid race.
- Optional variant price override is selected server-side at checkout; active variant changes are serialized against checkout.
- pgTAP security contract has `plan(23)` and exactly 23 assertions; it has not been run.

## Business data status

`Business Website.md` provided verified public identity information and candidate selling prices. It did not provide confirmed SKU mapping, actual stock counts, verified product photos or complete product specifications. A 74-row candidate proposal (66 single integer price candidates; 8 ambiguous/estimated cases) was generated outside Git under `/mnt/data/kundu-private-import-proposal/`. All candidates remain `draft_not_imported`; none are published. Nine robot-project tiers are retained as ranges, not SKU prices. Original source files are still required; see `PRODUCT_DATA_IMPORT.md`.

## Tests and verification

### Owner-reported Windows baseline (before this expanded backend work)

- Node 24.14.0, npm 11.21.1, Next 16.4.6, React 19.3.0.
- `npm install`: 358 packages; dev server and route smoke tests succeeded; typecheck passed; 6 tests passed; production build passed.
- ESLint failed in old FlatCompat config; `npm audit` reported 7 moderate vulnerabilities.

### Current assistant runtime (latest run)

- `npm test`: **23 passed, 0 failed**.
- `git diff --check`: passed.
- TypeScript/TSX transpile-only syntax inspection: 65 source files, 0 syntax diagnostics (not a full typecheck).
- Full `npm run typecheck`, `npm run lint`, `npm run build`: not executable here because `node_modules` and `package-lock.json` are absent.
- `npm audit`: exact dependency tree unavailable without lockfile; npm registry requests timed out. Do not claim the seven moderate alerts are fixed.
- SQL/pgTAP integration: not run; `psql`, Supabase CLI and Docker are absent.
- Playwright/browser/viewport screenshots: not executed.

## Blockers / unverified

1. Obtain the owner's Windows `package-lock.json` and exact `npm audit --json` output; the manifest is pinned but the dependency graph is not present in this runtime.
2. Install dependencies, run lint/typecheck/build against latest source and fix verified failures.
3. Execute migration + pgTAP and add RLS/role/concurrency fixtures on disposable Supabase local project.
4. Configure Supabase URL/publishable key/secret/HMAC locally; no connected backend exists now.
5. Obtain and approve original inventory, price analysis and robot price source files; publish products only after availability/spec/image checks.
6. Payment receiving numbers/instructions, delivery rates/areas, and reservation TTL remain unconfigured; checkout disabled.
7. Visual browser QA and deployment are pending.

## Immediate continuation

1. Import owner `package-lock.json` into the working copy and inspect `npm audit --json` from Windows.
2. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` on the exact working tree; correct the first real failures.
3. Start Supabase local, apply migration to disposable DB, execute the 23 pgTAP checks; expand with row-level fixture and concurrent-checkout tests.
4. Review product candidates and get original inventory/price/photo/spec sources.
5. Import the update bundle into the owner Windows clone, fetch GitHub, confirm the feature branch is still based on `f3ae4bc`, and push the local commit without force. Keep main unchanged.

## Guardrails

Never expose supplier identity, purchasing cost, margins, private stock information or credentials in shipped content. Never invent availability, prices, photos, specifications, customer reviews, delivery charges, operating hours or payment numbers. Keep guest checkout possible; keep manual payment pending until a human administrator verifies it. Never run checkout on an unconfigured backend.
