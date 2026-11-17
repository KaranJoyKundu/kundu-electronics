# Launch status — 17 November 2026

## Verified work completed

- PR #1 was squash-merged into `main` on 13 November 2026. Merge commit: `7f2a448426fb78f4467eaa377af8489f115c427a`.
- Launch work is being prepared on `feat/launch-prep`; do not push launch changes directly to `main`.
- Supabase project: `bussiness website`, project ref `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- Migration `initial_kundu_electronics_schema` applied on 17 November 2026.
- Live database check: 21 public tables; all 21 have RLS enabled; two private storage buckets; zero product rows, zero category rows and zero admin profiles.
- Store setting `checkout_enabled` is false. bKash and Nagad are both disabled.
- Database TypeScript definitions have been generated from this live project and committed under `src/lib/supabase/database.types.ts`.
- Only owner-provided photo assets are being used for public enquiry previews. Retailer images with unknown reuse permission and open-licensed assets pending attribution/share-alike review are excluded.

## What visitors can safely do

- Browse the storefront and owner-supplied product-photo enquiry gallery.
- Contact the shop to confirm the current selling price and actual availability.

The photo gallery is not a product inventory. It must not imply that pictured products are currently in stock or available for immediate purchase.

## Not launched / not yet verified

- No production hosting deployment has been completed yet.
- No production runtime environment variables have been configured in a hosting provider.
- The public product catalogue intentionally remains empty pending owner confirmation of selling prices, stock status and publishable descriptions.
- No admin profile exists yet; admin login is not usable until a store owner is created in Supabase Auth and assigned an admin role in `public.admin_profiles`.
- Checkout, order submission, bKash/Nagad and delivery are disabled pending complete owner configuration and end-to-end tests.
- Supabase security advisor warnings still require review. The application dependency audit previously identified seven moderate indirect findings in the TypeScript-ESLint/minimatch development-tooling chain.

## Hosting environment required

Configure these values in the hosting provider's encrypted environment settings, not in Git:

- `NEXT_PUBLIC_SUPABASE_URL=https://tcapxmiroikbsozvucmt.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — fetch the current publishable key from Supabase Project Settings → API Keys.
- `SUPABASE_SECRET_KEY` — server-only Secret API key.
- `APP_HMAC_SECRET` — 32 cryptographically random bytes encoded as 64 hexadecimal characters.
- `NEXT_PUBLIC_SITE_URL` — exact canonical origin assigned to the production deployment.

Never share the secret key in chat, issue comments, source control, build logs or a `NEXT_PUBLIC_*` variable. Set the site URL to the actual deployed origin before enabling any mutating checkout flow.

## Owner confirmations still required before selling

1. Exact customer-facing selling prices and actual availability/stock tracking for each product.
2. Approved delivery areas, charges and delivery policy.
3. Verified bKash and/or Nagad receiving numbers and customer instructions.
4. Owner-created admin account and role assignment.
5. Approval of final product descriptions/specifications and remaining photo publication rights.

## Safe launch gate

A visually available website may launch in enquiry-only mode. Do not enable payment, ordering, stock claims or admin operations until the configuration above is completed and the live application is tested on the production domain.
