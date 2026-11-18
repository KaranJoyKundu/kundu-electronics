# PROJECT_STATE — Kundu Electronics

**Last updated:** 18 November 2026 (Asia/Dhaka)
**Production branch:** feat/launch-prep
**Current follow-up branch:** `feat/founder-projects-storefront-orders` (PR #4 open against production branch)
**Latest verified launch-branch commit:** `900d331f396027becca4e95fcdd8b91683a55087`
**Remote main:** `7f2a448426fb78f4467eaa377af8489f115c427a` (unchanged by launch work)
**Launch PR:** [#3](https://github.com/KaranJoyKundu/kundu-electronics/pull/3) (open, draft, not merged)
**Repository:** `KaranJoyKundu/kundu-electronics` (private)
**Production:** [https://kundu-electronics.vercel.app](https://kundu-electronics.vercel.app) (Vercel READY; deployed from `feat/launch-prep`)

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

The repository is private. Active launch changes remain isolated on `feat/launch-prep`; PR #3 is open, draft and unmerged. Do not merge to `main`, force-push, or replace owner commits without explicit approval. The current Vercel production branch is `feat/launch-prep`, so commits to this branch can trigger a production deployment; verify the new deployment after every release-relevant commit.

## Implemented foundation

- Responsive storefront and routes for home, shop, products, cart, founder story, projects, contact, support and shipping/returns.
- Centralized public business settings with verified contact details; missing facts remain unset.
- Supabase browser/server/public/admin client boundaries, auth proxy, admin/staff authorization and protected admin foundations.
- Product/category/variant and image management; product images use a private Storage bucket.
- Database-backed catalogue search, one-character autocomplete, server-side pagination and filters.
- Cart external store using `useSyncExternalStore`, persisted browser cart restore/write and blocked-storage fallback.
- Server checkout/order/payment APIs with authoritative DB price and delivery calculation, idempotency and guest-order access.
- Inventory states distinguish unknown, tracked and untracked stock; stock movements are auditable.
- Website order creation is enabled without collecting payment. Manual bKash/Nagad submission remains unavailable until receiving details and customer instructions are configured. Delivery speed options are Standard 12h–1 day / ৳0 and Urgent 30–60 minutes / ৳50.
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

## Business data and catalogue status — 18 November 2026

The original 211-SKU product set from the owner's inventory workbook remains in the live Supabase catalogue, with 12 resistor-named rows archived and nine project bundle rows added:

- 208 published product rows, 18 published categories and 220 inventory records (199 original catalogue rows remain published, including P091, plus nine kits).
- Published catalogue count is 208.
- Public price state: 49 products have no selling price and show “Price on request”.
- Current public availability: 117 in stock, 34 low stock, 42 out of stock, six unknown/unrecorded and nine build-to-order kits.
- All 211 product photographs from the supplied archive are included in the SKU-mapped optimized sprite `public/product-previews/kundu-catalogue-sprite.webp`. The owner confirmed rights/licensing for the complete set; 19 Creative Commons source photos are attributed on `/image-credits`.
- The product shop has nine pages at 24 records per page. The photo sprite retains all 211 original SKU tiles; project kits use labelled vector artwork.

The original inventory workbook remains private and is not committed. Only customer-facing names, categories, selling prices and public availability states were imported. Buying prices, margins, suppliers, internal notes and private stock counts remain excluded. Six unknown stock rows and 49 missing selling prices were not filled by inference.

## Remaining launch checks

1. Owner to visually test the production site on desktop and mobile, including all nine shop pages, product photos, search/filtering, product detail pages and WhatsApp enquiry-cart handoff.
2. Owner to sign in at `/admin/login` and verify protected admin access; one admin profile exists, but sign-in has not been confirmed in this run.
3. Owner to verify physical prices and stock; fill the 49 selling prices and six unknown stock quantities when confirmed.
4. Configure owner-approved delivery zones/charges and bKash/Nagad receiving details/instructions.
5. Keep bKash/Nagad disabled until verified receiving numbers and instructions are supplied. Website orders remain unpaid until the shop confirms stock, delivery and the final amount.
6. Continue reviewing the remaining 14 high development-only dependency audit findings (GHSA-fc5q-39xc-vjpf in picomatch) and Supabase security-advisor warnings.

## Guardrails

Never publish supplier identity, purchase prices, profit margin, master workbook data, private stock notes, credentials or customer records. Never invent stock, specifications, images, reviews, delivery charges, opening hours, warranty promises or payment numbers. A payment reference is not proof of payment. Keep the checkout disabled until backend and owner configuration are verified.


## 2026-11-13 dependency-security follow-up

- The committed Windows lockfile is now present on the remote feature branch. Lockfile v3 resolves `@typescript-eslint/typescript-estree@8.72.2` with nested `minimatch@10.2.6` (declared `^10.2.2`); a separate root `minimatch@3.1.5` serves ESLint plugins and is outside this advisory's affected range.
- GHSA-g3hv-75wg-m249 is fixed upstream in minimatch `11.0.1`, but 11.x does not satisfy the TypeScript-ESTree `^10.2.2` dependency range. Do not force an override or hand-edit lockfile metadata. No dependency versions were changed. Track the advisory until a stable TypeScript-ESLint release declares a compatible minimatch 11 range.
- Current stable `@typescript-eslint/typescript-estree` observed on npm is `8.72.2`; `8.72.3-alpha.8` is a prerelease and is not suitable as a production dependency update without explicit prerelease evaluation.
- Next.js `v16.4.6` source was inspected: `useTypeScriptCli` is an accepted boolean in `config-schema.ts`; `false` selects the TypeScript API worker in `packages/next/src/build/type-check.ts`. `runTypeCheck.ts` explicitly filters `.next/dev/types` during build typechecking. Keep the setting pending owner verification; the warning marker is consistent with the disabled experimental CLI checker, not an unknown config property.
- GitHub integration can inspect repository files but cannot run npm commands in the owner's Windows environment or produce a full Git bundle from the connected remote. `npm explain`, `npm ls`, `npm audit fix --dry-run`, `npm ci`, typecheck, lint, tests and build were not executed in this session. Preserve the owner's prior Windows PASS report; it is not a rerun for this security follow-up.


## 18 November 2026 founder, project-kits and ordering follow-up

- Database catalogue state after the storefront migration: 208 published rows, 18 published categories. P091 (1kΩ Resistor Box 5000pcs) stays published at the existing ৳1 price. Twelve other resistor-named records are archived with discontinued availability; records were not deleted so historical order lines remain intact.
- Nine build-to-order project kit products were added: LFR-T1–T3, SB-T1–T3 and RC-T1–T3. Kit costs are copied from the uploaded BOM sheet, which labels the amounts as estimates. The site treats them as estimates until the shop confirms final scope and amount. Exact component P-codes are annotated only where the catalogue item is an exact match; the kit's own bundle ID is not a component SKU.
- Added /projects with Bee Biped Robot, LFR, Soccer Bot, RC Speed Battle and Drone enquiry cards. Added a horizontal five-slide home carousel (3-second interval) and /about founder story. The Bee Biped repo contains no tracked project photos, so the project card uses a labelled original illustration and links to the source repo.
- Website orders enabled with server-side prices, delivery charges, idempotency and existing stock-confirmation logic. Delivery speeds Standard 12h–1day / ৳0 and Urgent 30–60min / ৳50.
- No payment is taken. bKash/Nagad remain disabled pending verified receiving details. Order payment status remains not_submitted; shop confirms inventory/address and arranges payment.
- Cart offers website checkout, WhatsApp formatted order summary and direct phone call.
- Follow-up branch: feat/founder-projects-storefront-orders; production branch remains feat/launch-prep; default main is not targeted.
