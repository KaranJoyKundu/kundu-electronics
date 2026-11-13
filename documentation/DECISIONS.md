# DECISIONS

## D-001 — Continue in the owner-authorized Kundu repository and feature branch

- **Date:** 2026-11-13
- **Context:** Owner confirmed the correct GitHub identity is `KaranJoyKundu`, not `k-j-kundu`; the private repository `KaranJoyKundu/kundu-electronics` is accessible and contains the existing baseline/feature history.
- **Decision:** Continue on `feat/storefront-foundation`, preserve existing changes and commits, keep `main` stable, fetch/reconcile remote refs before pushing.
- **Reason:** Avoid repository duplication or history loss and work in the exact owner repo.
- **Alternatives:** Use similarly named `k-j-kundu` repository (rejected; wrong owner and empty); create new project/repo (no longer needed).
- **Consequences:** Local worktree origin is currently a Git bundle path; set/verify GitHub remote deliberately before pushing.

## D-002 — Use Next.js App Router, React, TypeScript and Tailwind CSS 4

- **Date:** 2026-11-13
- **Decision:** Next.js 16.4.6, React 19.3.0, strict TypeScript and Tailwind CSS 4.3.3.
- **Reason:** Server-rendered product/category pages, route handlers, reusable responsive UI and maintainable typed code.
- **Consequences:** Node 22.6+ for current test command; owner uses Node 24.14.0. Dependencies require lockfile verification.

## D-003 — Modular monolith with Supabase Postgres, Auth and Storage

- **Date:** 2026-11-13
- **Decision:** Use Next.js server actions/route handlers and Supabase PostgreSQL/Auth/Storage; do not introduce microservices.
- **Reason:** Small business operational scale, atomic SQL transactions and manageable deploy surface.
- **Consequences:** Migration is not applied; project credentials and DB integration tests remain required.

## D-004 — Public business configuration is separate from private inventory

- **Date:** 2026-11-13
- **Decision:** Public details live in `src/config/business.ts`; private source files/costs remain outside Git. Public Product data has selling price only.
- **Reason:** Prevent supplier/purchase/profit information from leaking in frontend/API or Git.
- **Consequences:** Keep import proposal outside repository until reviewed; strip private columns before ingestion.

## D-005 — Empty published catalogue until verified product data is approved

- **Date:** 2026-11-13
- **Decision:** All 74 candidate component/kit rows and nine robot price ranges remain separate review material; no product is published.
- **Reason:** The brief lacks stock, full SKUs, images/specs, and some prices are ambiguous or estimated.
- **Consequences:** Shop remains genuinely empty until verified data and availability are approved.

## D-006 — Integer BDT and server-authoritative checkout

- **Date:** 2026-11-13
- **Decision:** Monetary values are integer BDT in `BIGINT`; server loads current prices, delivery charges and stock, then computes totals inside a transaction.
- **Reason:** Avoid floating-point drift and browser price tampering.
- **Consequences:** Browser cart is a convenience only; database checkout RPC is authoritative.

## D-007 — Unknown stock is a first-class state

- **Date:** 2026-11-13
- **Decision:** Inventory tracking modes are `unknown`, `tracked`, `untracked`; unknown quantity is null, not zero or in-stock.
- **Reason:** Avoid false stock claims.
- **Consequences:** Admin must configure stock/tracking before an orderable product is offered.

## D-008 — Variants share parent-product inventory for first release

- **Date:** 2026-11-13
- **Decision:** Variant-specific prices/options are supported, but stock count is at product level and shared among variants.
- **Reason:** No source data currently establishes per-variant quantities.
- **Alternatives:** Variant inventory now (not justified by provided sources).
- **Consequences:** Revisit before importing any product whose variants need distinct inventory.

## D-009 — Manual payment is not proof of payment

- **Date:** 2026-11-13
- **Decision:** bKash/Nagad start disabled. Submissions stay `pending_verification`; only authorized staff can verify/reject, with actor/time/audit history.
- **Reason:** Transaction reference is user-entered and there is no gateway verification API.
- **Consequences:** Owner must configure receiving details and verification process before checkout activation.

## D-010 — Delivery and stock reservation policy are not assumed

- **Date:** 2026-11-13
- **Decision:** Delivery zones/charges are nullable/disabled; reservation TTL is null (no automatic expiry) until owner chooses a policy.
- **Reason:** Avoid inventing delivery prices, areas or reservation duration.
- **Consequences:** Checkout stays disabled until owner configures delivery and payment.

## D-011 — Product image bucket is private

- **Date:** 2026-11-13
- **Decision:** Use private Storage bucket with RLS that allows public access only to image paths linked to published product/category rows; staff can preview draft images.
- **Reason:** Public buckets bypass object-level read control and could expose draft assets.
- **Consequences:** Verify signed URL reads with Supabase Storage integration tests.

## D-012 — Visual design measurements remain provisional

- **Date:** 2026-11-13
- **Decision:** Use original Kundu design tokens and SparkFun page structures; do not claim exact reference CSS metrics.
- **Reason:** Browser screenshot/viewport/CSS inspection did not occur in research environment.
- **Consequences:** Visual tuning and responsive QA remain explicit tasks.


## D-013 — Exclude isolated Next.js development route validators from strict application typecheck

- **Date:** 2026-11-13
- **Decision:** Keep `.next/types/**/*.ts` in TypeScript includes, explicitly exclude `.next/dev`, and run `next typegen` before `tsc --noEmit`.
- **Context:** Next.js 16 with isolated development builds can create a separate `.next/dev/types` route validator. A stale dev validator may be checked alongside the production route types and report an incompatible generated `Route` constraint.
- **Reason:** Use generated production types for the explicit typecheck and avoid hand-editing `.next` output. The upstream issue documents the stale development-type inclusion failure mode: https://github.com/vercel/next.js/issues/96620.
- **Alternatives considered:** Delete generated files manually (rejected; ephemeral and non-reproducible); disable TypeScript strictness (rejected); turn off isolated dev builds (not necessary unless the exclusion fails).
- **Consequences:** The change must be verified on Windows with an existing `.next/dev` directory and on a clean checkout using `next typegen`.

## D-014 — Use an external store for cart hydration and persistence

- **Date:** 2026-11-13
- **Decision:** Cart state is held in a small external store consumed through `useSyncExternalStore`; component effects no longer copy localStorage into React state and write it back.
- **Reason:** This avoids synchronous state updates in effects, preserves SSR/hydration semantics and supports a current-tab memory fallback if browser storage is blocked.
- **Alternatives considered:** Keep duplicated effect-managed `useState` state and add lint suppression (rejected); use a render-time state reset (rejected).
- **Consequences:** Test snapshot restore, canonical persistence, invalid storage, unavailable storage and browser multi-tab storage events.

## D-015 — Do not force the npm audit fix without the exact lockfile plan

- **Date:** 2026-11-13
- **Decision:** Do not add a `minimatch` override or run `npm audit fix --force` based only on the supplied summary report.
- **Context:** Seven moderate indirect package flags all resolve through the TypeScript-ESLint dependency tree; the report marks a fix available but does not include exact installed versions or the dependency resolution section.
- **Reason:** The advisory's patched minimatch release is 11.0.1, but compatibility must be checked against the actual parent package ranges and lockfile.
- **Alternatives considered:** Force `minimatch@11` using npm overrides (rejected until compatibility is verified); upgrade unrelated top-level dependencies (rejected).
- **Consequences:** Obtain the Windows `package-lock.json`, inspect `npm audit fix --dry-run --json`, then use a non-force semver-compatible update and rerun the full suite.
