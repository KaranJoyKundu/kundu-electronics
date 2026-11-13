# Kundu Electronics

Responsive e-commerce storefront and modular-monolith backend foundation for Kundu Electronics, Khulna, Bangladesh.

## Current implementation

- Next.js 16 App Router, React 19.3, TypeScript and Tailwind CSS 4.
- Shared storefront shell, homepage, shop page, product details route, cart and information routes.
- Database-backed catalogue search, bounded listing pagination, category/price/sort filters and one-character search support.
- Product options with server-loaded variant price overrides and shared product-level inventory semantics.
- Supabase SSR/browser/server-only client separation, Next.js 16 `proxy.ts`, admin login and role checks.
- Admin routes/actions for products, categories, variants, images, inventory, orders, manual payment verification and settings.
- PostgreSQL migration covering catalogue, inventory, customers, orders, payment submissions/events, audit records, rate limiting, RLS and private storage buckets.
- Unit tests for catalogue, variant pricing, checkout validation/idempotency and image signatures.

## Not production-connected yet

No Supabase project is configured, no migration has been applied, no product data is published, and checkout/payment methods are disabled by default. Database functions and RLS policies are implementation drafts until executed and tested against a real local/remote PostgreSQL environment. Do not claim live orders, admin authentication, stock, or payments until those integrations pass verification.

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set local Supabase variables only in `.env.local`. Keep `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` server-only. Never commit `.env.local`.

Run checks:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## Project continuity

Read `START_HERE.md` and `documentation/PROJECT_STATE.md`. Full SparkFun research is preserved in `documentation/research/`. Product candidates are kept separately for owner review and are not published by default.
