# CHANGELOG

## 2026-11-13 — Backend integration foundation (`de253ee`, pushed to feature branch)

- Added Supabase browser/server/public/admin client boundaries and Next.js 16 auth proxy.
- Added database-backed product search, server-side listing filters/pagination and cart-ID-only product lookup.
- Added variant selection, variant price resolver and admin variant management; variant stock is shared with parent product.
- Added checkout, guest order access, order status and manual payment API routes with validation, origin checks, HMAC idempotency and rate limiting.
- Expanded admin routes/actions for catalogue, categories, variants, private image management, inventory, orders, payment verification and settings.
- Expanded PostgreSQL migration with products/categories/variants/images/specifications, stock states and movement history, customers/addresses, delivery configuration, orders/snapshots, reservations, payments/events, audit events, rate limiting, RLS, explicit grants and private Storage policies.
- Added 23 pgTAP security-contract assertions (not executed; SQL environment unavailable).
- Added candidate product import proposal outside Git; 74 candidates, with 8 pricing cases held for review; zero published.
- The owner imported and pushed the backend foundation to `KaranJoyKundu/kundu-electronics` on `feat/storefront-foundation` as `de253ee`; remote ref confirmed through GitHub. `main` remains at `d883393`.
- Unit tests: 23 passed; `git diff --check` passed. Full lint/typecheck/build and SQL tests remain unverified in this runtime.

## 2026-11-12 — Storefront foundation

- Initialized project documentation and Git baseline.
- Added responsive storefront shell, home/shop/about/support/contact/shipping/cart/product route foundations.
- Added public-safe business configuration, empty catalogue and search/filter utilities.
- Preserved SparkFun research package under `documentation/research/`.

## 2026-11-13 — Owner verification and repository connection

- Confirmed connected GitHub identity `KaranJoyKundu` and private repository `KaranJoyKundu/kundu-electronics`.
- Confirmed remote `main` at `d883393` and feature branch at `de253ee`.
- Corrected handoff to reflect that the backend foundation is pushed; subsequent verification fixes are a separate local commit.


## 2026-11-13 — TypeScript, React effects and catalogue-boundary remediation (`feat/storefront-foundation`)

- Updated `tsconfig.json` to exclude `.next/dev` generated route types and run `next typegen` before the strict TypeScript check. No generated output was edited.
- Added `parseCatalogSearchRows(unknown)` and used it in both catalogue API endpoints, removing implicit-`any` callbacks at the Supabase RPC boundary.
- Narrowed the dynamic payment method to the supported `"bkash" | "nagad"` literals after runtime validation.
- Replaced cart provider effect-managed hydration/persistence with an external store and `useSyncExternalStore`; added initial restore, persistence, malformed storage and blocked-storage tests.
- Changed cart product loading and search suggestions to derive pending/empty/error states from query-keyed asynchronous results; added abort handling.
- Memoized the order refresh function, included it in effect dependencies and aborts obsolete requests.
- Changed SearchBox semantics to an explicit combobox with listbox options, resolving the reported implicit textbox `aria-expanded` warning.
- Added catalogue API query validation, product/search response parsing, Supabase RPC parser and corresponding tests.
- Analysed the supplied npm audit report: seven moderate indirect alerts, rooted in the nested `minimatch` GHSA-g3hv-75wg-m249 / CVE-2026-118764 advisory. No forced dependency change was made because the actual Windows lockfile is not available in this worktree.
- Updated `PROJECT_STATE.md`, `TASK_TRACKER.md`, `TEST_REPORT.md`, `ISSUES_AND_LIMITATIONS.md`, `DECISIONS.md` and `START_HERE.md`.
- Latest local unit test run: 38 passed, 0 failed. Targeted strict TypeScript check passed. The remediation is committed on the existing feature branch; its current tip is shown by `git log -1`. Full app typecheck/lint/build remain unverified because dependencies are absent in this execution runtime; npm audit cannot re-run without the lockfile.
