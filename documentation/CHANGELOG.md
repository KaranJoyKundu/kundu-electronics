# CHANGELOG

## 2026-11-15 — Launch-readiness documentation

- Rewrote README as a project overview, setup guide and honest production-readiness snapshot.
- Reconciled the handoff, project state, task tracker, issue list and test report with the current remote feature branch.
- Corrected stale lockfile notes: package-lock.json exists on feat/storefront-foundation; use npm ci.
- Added a focused 48-hour launch plan with transactional release gates and a catalogue/contact fallback.
- Recorded the main/feature branch divergence and the requirement to review the main-only commit before merging.
- No application source, database migration, environment secret, product record or business configuration was changed.

## 2026-11-13 — Backend integration foundation

- Added Supabase browser/server/public/admin client boundaries and Next.js 16 auth proxy.
- Added database-backed product search, server-side listing filters/pagination and cart-ID-only product lookup.
- Added variant selection, variant price resolver and admin variant management; variant stock is shared with parent product.
- Added checkout, guest order access, order status and manual payment API routes with validation, origin checks, HMAC idempotency and rate limiting.
- Expanded admin routes/actions for catalogue, categories, variants, private image management, inventory, orders, payment verification and settings.
- Expanded PostgreSQL migration with products/categories/variants/images/specifications, stock states and movement history, customers/addresses, delivery configuration, orders/snapshots, reservations, payments/events, audit events, rate limiting, RLS, explicit grants and private Storage policies.
- Added 23 pgTAP security-contract assertions (not executed; SQL environment unavailable).
- Added candidate product import proposal outside Git; 74 candidates, with 8 pricing cases held for review; zero published.
- Unit tests and the later verification follow-up are documented in TEST_REPORT.md.

## 2026-11-12 — Storefront foundation

- Initialized project documentation and Git baseline.
- Added responsive storefront shell, home/shop/about/support/contact/shipping/cart/product route foundations.
- Added public-safe business configuration, empty catalogue and search/filter utilities.
- Preserved SparkFun research package under documentation/research/.

## Repository workflow

- The application foundation is on feat/storefront-foundation. main and the feature branch had diverged at the 15 November review; reconcile and review before merging.
- Keep production credentials and private business data outside Git.
- Update PROJECT_STATE.md, TASK_TRACKER.md, TEST_REPORT.md and ISSUES_AND_LIMITATIONS.md only when new evidence changes their status.
