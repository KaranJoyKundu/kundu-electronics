# Kundu Electronics

Responsive storefront and e-commerce foundation for Kundu Electronics, Khulna, Bangladesh.

## Current implementation

- Next.js 16 App Router, React 19.3, TypeScript and Tailwind CSS 4.
- Storefront shell, homepage, shop, product detail, cart and information pages.
- Live Supabase project provisioned in ap-northeast-1; initial schema migration applied on 17 November 2026.
- The migration created 21 public tables, enabled RLS on all 21, and created two private storage buckets.
- Supabase TypeScript database definitions are generated from the connected project in `src/lib/supabase/database.types.ts`.
- Search, filtering, product options, cart, admin, order and manual-payment foundations are implemented in the codebase.
- Owner-provided product photo previews are presented separately from the purchasable catalogue. Each gallery item directs customers to confirm current price and availability with the shop.

## Not live for sales yet

The connected database currently contains zero products, categories and admin profiles. Checkout is disabled, bKash and Nagad are disabled, and delivery zones are not configured. Do not claim live orders, working admin accounts, verified stock, or payments until those features are configured and tested end-to-end.

The production hosting project and runtime environment variables are not yet configured. A public deployment still needs a connected hosting account and server-side secrets. Never put `SUPABASE_SECRET_KEY` or `APP_HMAC_SECRET` in client code, `NEXT_PUBLIC_*`, Git, or chat.

## Local setup

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Configure Supabase values only in `.env.local`. Run checks:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## Project continuity

Read `START_HERE.md`, `documentation/PROJECT_STATE.md`, and `documentation/LAUNCH_STATUS.md`. Full SparkFun research is preserved in `documentation/research/`. The customer-facing product catalogue remains empty until the owner confirms selling prices, stock status, descriptions and publication approval.
