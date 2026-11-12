# CHANGELOG

## 2026-11-13 — Backend integration foundation (`c38f358`, local commit; push pending)

- Added Supabase browser/server/public/admin client boundaries and Next.js 16 auth proxy.
- Added database-backed product search, server-side listing filters/pagination and cart-ID-only product lookup.
- Added variant selection, variant price resolver and admin variant management; variant stock is shared with parent product.
- Added checkout, guest order access, order status and manual payment API routes with validation, origin checks, HMAC idempotency and rate limiting.
- Expanded admin routes/actions for catalogue, categories, variants, private image management, inventory, orders, payment verification and settings.
- Expanded PostgreSQL migration with products/categories/variants/images/specifications, stock states and movement history, customers/addresses, delivery configuration, orders/snapshots, reservations, payments/events, audit events, rate limiting, RLS, explicit grants and private Storage policies.
- Added 23 pgTAP security-contract assertions (not executed; SQL environment unavailable).
- Added candidate product import proposal outside Git; 74 candidates, with 8 pricing cases held for review; zero published.
- Commit `c38f358` created on `feat/storefront-foundation`; worktree clean. GitHub push not completed because this runtime could not resolve `github.com`.
- Unit tests: 23 passed; `git diff --check` passed. Full lint/typecheck/build and SQL tests remain unverified in this runtime.

## 2026-11-12 — Storefront foundation

- Initialized project documentation and Git baseline.
- Added responsive storefront shell, home/shop/about/support/contact/shipping/cart/product route foundations.
- Added public-safe business configuration, empty catalogue and search/filter utilities.
- Preserved SparkFun research package under `documentation/research/`.

## 2026-11-13 — Owner verification and repository connection

- Confirmed connected GitHub identity `KaranJoyKundu` and private repository `KaranJoyKundu/kundu-electronics`.
- Confirmed remote `main` and `feat/storefront-foundation` branch heads.
- Corrected stale repository recovery assumptions in current handoff; remote push is still pending local ref/worktree reconciliation.
