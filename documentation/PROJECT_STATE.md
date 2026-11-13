# PROJECT_STATE — Kundu Electronics

**Last updated:** 13 November 2026 (Asia/Dhaka)
**Active branch:** `feat/storefront-foundation`
**Remote feature base at start of this follow-up:** `5949f4cd3152aa595dd6433aaac27a7b85f3a87a`
**Remote main:** `d88339395e6a1e34f9da904650efd1421480cf00`
**Repository:** `KaranJoyKundu/kundu-electronics` (private)

## Objective

Deliver a production-capable Kundu Electronics electronics-components store in Khulna, Bangladesh. Prices are BDT (৳). SparkFun informs information architecture and shopping patterns; the shop's own brand and verified business information take precedence.

## Architecture

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Modular monolith with Supabase PostgreSQL/Auth/Storage integration.
- Separate browser, public-server and privileged server Supabase clients; privileged operations remain server-only.
- Next.js 16 `src/proxy.ts` handles authentication cookie refresh.
- Public business configuration is centralized in `src/config/business.ts`.
- Public product records contain selling prices only; purchase costs, supplier data and margins remain private and are not modeled in the public type.
- Catalogue queries use server-side pagination and database search; products remain unpublished until approved.
- Authoritative money calculations use integer BDT in PostgreSQL `BIGINT`, not floating point.

## Repository and branch guardrails

The actual repository is `KaranJoyKundu/kundu-electronics`, private, with the connected GitHub account having admin/push access. Work only on `feat/storefront-foundation`. Keep `main` at `d883393...`; no merge or force-push is authorized. At the start of this follow-up the remote feature head was `5949f4c...` and matched the available Git bundle. The current follow-up is being prepared on top of that commit; use `git log -1` for its final SHA. The assistant container has no Windows working tree and no remote shell network access.

## Implemented foundation

- Responsive storefront and routes for home, shop, products, cart, about, contact, support and shipping/returns.
- Centralized public business settings with verified contact details; missing facts remain unset.
- Supabase browser/server/public/admin client boundaries, auth proxy, admin/staff authorization and protected admin foundations.
- Product/category/variant and image management; product images use a private Storage bucket.
- Database-backed catalogue search, one-character autocomplete, server-side pagination and filters.
- Cart external store using `useSyncExternalStore`, persisted browser cart restore/write and blocked-storage fallback.
- Server checkout/order/payment APIs with authoritative DB price and delivery calculation, idempotency and guest-order access.
- Inventory states distinguish unknown, tracked and untracked stock; stock movements are auditable.
- Manual bKash/Nagad submission and authorized verification states exist but payments and delivery remain unconfigured.
- All SparkFun research documents are preserved under `documentation/research/`.

## Latest Windows-verification follow-up changes

### Source changes

- Added `src/lib/checkout/payment-methods.ts`: parses public RPC configuration from `unknown` and only returns `bkash`/`nagad` entries with non-empty receiving details/instructions. `PublicCheckoutConfig` now uses this typed structure.
- Added tests for supported/unsupported/malformed payment configuration.
- Added `src/lib/orders/order-summary.ts`: validates the order-status API payload before it enters the client state, including safe integer BDT values, order lines and payment status/rejection information.
- Refactored `OrderConfirmationClient`: order loads are keyed by `orderId`; no loading setter is called synchronously from the effect. Fetch completions are guarded by `AbortController` and request sequence. Manual refresh after payment uses the same guard.
- Removed the unstable `products` dependency from the cart page's `useMemo` by building the small product-id map directly.
- Changed the non-reassigned cart test `stored` fixture from `let` to `const`.

### Next.js route types

- `tsconfig.json` now includes both `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`, matching the Next 16 isolated-build template and avoiding Next rewriting the base config back and forth.
- `tsconfig.typecheck.json` narrows standalone typechecking to `.next/types` and source files while excluding `.next/dev`, preventing the two independently generated route maps from being typechecked together.
- `npm run typecheck` runs `next typegen` then `tsc --project tsconfig.typecheck.json --noEmit --incremental false`.
- `next.config.ts` sets `experimental.useTypeScriptCli: false` for Next 16.4.x so the built-in TypeScript API build checker can filter stale `.next/dev/types` validators. This is a version-specific workaround informed by the upstream Next.js issue; it must be verified on the owner's exact Windows install before considering it final. See https://github.com/vercel/next.js/issues/96620 and https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/typescript/runTypeCheck.ts.
- No generated `.next` file was edited.

## Verification results in this assistant runtime

- `npm test`: **42 passed, 0 failed**. Includes the previous 38 tests plus payment configuration and order-summary parser tests.
- Strict targeted TypeScript check for `payment-methods.ts` and `order-summary.ts`: **passed** with global TypeScript 5.8.3.
- `git diff --check`: to be rerun after documentation update and before commit.
- Full `npm run typecheck`: blocked (`next: not found`; no `node_modules`).
- Full `npm run lint`: blocked (`eslint: not found`; no `node_modules`).
- `npm run build`: blocked (`next: not found`; no `node_modules`).
- `npm audit`: blocked with `ENOLOCK`; no `package-lock.json` exists in the uploaded project, GitHub branch tree or current worktree.
- npm registry test: `EAI_AGAIN registry.npmjs.org`; dependencies could not be installed here.
- Supabase SQL/pgTAP, real RLS and browser/Playwright checks remain unexecuted.

The owner's last Windows test report (before this follow-up) identified 1 TypeScript error, 2 lint errors and 1 warning, 38 tests passing, and a production build that stopped during TS checking. Those are not current test results for the new source. The owner must rerun all five commands on Windows.

## Dependency audit state

The available supplied `npm-audit.json` is UTF-16LE and reports 7 moderate, 0 low, 0 high, 0 critical findings across 447 dependencies. The findings are indirect and cascade through TypeScript-ESLint packages to a nested `minimatch` under `@typescript-eslint/typescript-estree`. The report marks `fixAvailable: true` but contains no exact package resolution map. Since the actual Windows `package-lock.json` was not supplied and is not in GitHub, **no dependency upgrade, override or audit fix was applied**. Obtain the actual lockfile and a new audit report before choosing a fix. Do not use `npm audit fix --force`.

## Business data status

The consolidated business brief is not committed. A private candidate import proposal exists outside Git; all candidate products remain unapproved. Missing stock, specifications and photos are not fabricated. Original inventory/pricing and robot-price source documents are still required. Do not expose buying prices, supplier identity or private financial data.

## Blockers and next steps

1. Import/pull this feature-branch follow-up on Windows; verify no uncommitted owner edits are overwritten.
2. Supply the actual Windows `package-lock.json` and fresh `npm audit --json`; run non-force dry-run remediation only after inspecting the complete lock graph.
3. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm audit` on the owner's Node 24.14/npm 11.21 environment.
4. If the generated route type error persists, inspect the actual `.next/dev/types/validator.ts`, `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`; do not edit generated files.
5. Once verification is green, run SQL/pgTAP and RLS/concurrency tests on disposable Supabase, then browser checkout and responsive tests.
6. Configure approved delivery and bKash/Nagad values before enabling checkout.

## Guardrails

Never publish supplier identity, purchase prices, profit margin, master workbook data, private stock notes, credentials or customer records. Never invent stock, specifications, images, reviews, delivery charges, opening hours, warranty promises or payment numbers. A payment reference is not proof of payment. Keep the checkout disabled until backend and owner configuration are verified.
