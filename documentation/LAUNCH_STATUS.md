# Launch status — 17 November 2026

## Verified work completed

- PR #1 was squash-merged into `main` on 13 November 2026. Merge commit: `7f2a448426fb78f4467eaa377af8489f115c427a`.
- Current launch work is prepared on `feat/launch-prep`; do not push launch changes directly to `main`.
- Supabase project: `bussiness website`, project ref `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- Migration `initial_kundu_electronics_schema` applied on 17 November 2026.
- Live database check: 21 public tables; all 21 have RLS enabled; two private storage buckets; zero product rows, zero category rows and zero admin profiles.
- Checkout is disabled; bKash and Nagad are both disabled.
- Supabase TypeScript definitions were generated from the live project and are in `src/lib/supabase/database.types.ts`.

## Safe public mode

- The photo gallery is a set of owner-provided image previews, not a stock list or purchasable catalogue.
- Gallery cards contain no price or availability claims and direct customers to WhatsApp to ask the shop.
- Images with unknown reuse permission and open-licensed images pending attribution/share-alike review are excluded.
- The repository has no private supplier, purchase-cost or margin data.

## Not launched / not yet verified

- No production hosting deployment has been completed.
- No production runtime environment variables have been configured in a hosting provider.
- The public product catalogue remains empty pending owner confirmation of selling prices, stock status and publishable descriptions.
- No admin profile exists; an admin account must be created through Supabase Auth and assigned a role in `public.admin_profiles`.
- Checkout, order submission, bKash/Nagad and delivery remain disabled pending owner configuration and end-to-end tests.
- Supabase security advisor warnings still require review.
- The prior npm audit found seven moderate indirect issues in the TypeScript-ESLint/minimatch development-tooling dependency chain; see `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

## Hosting environment required

Configure these values in the hosting provider's encrypted environment settings, never in Git:

- `NEXT_PUBLIC_SUPABASE_URL=https://tcapxmiroikbsozvucmt.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — fetch the current key from Supabase Project Settings → API Keys.
- `SUPABASE_SECRET_KEY` — server-only Secret API key.
- `APP_HMAC_SECRET` — 32 cryptographically random bytes encoded as 64 hexadecimal characters.
- `NEXT_PUBLIC_SITE_URL` — the exact canonical origin assigned to the production deployment.

Never share the secret key in chat, issue comments, source control, build logs or a `NEXT_PUBLIC_*` variable. Set the site URL to the actual deployed origin before enabling mutating checkout flows.

## Owner confirmations required before selling

1. Exact customer-facing selling prices and actual availability/stock tracking per product.
2. Approved delivery areas, charges and delivery policy.
3. Verified bKash and/or Nagad receiving numbers and customer instructions.
4. Owner-created admin account and role assignment.
5. Approval of final product descriptions/specifications and remaining photo publication rights.

A visually public website may launch in enquiry-only mode. Do not enable payment, ordering, stock claims or admin operations until the configuration above is completed and the live application is tested on the production domain.
