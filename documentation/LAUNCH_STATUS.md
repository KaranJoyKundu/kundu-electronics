# Launch status — 17 November 2026

## Verified implementation

- PR #1 was squash-merged into `main` on 13 November 2026. Merge commit: `7f2a448426fb78f4467eaa377af8489f115c427a`.
- Current launch work is isolated on `feat/launch-prep`. Draft PR #3: https://github.com/KaranJoyKundu/kundu-electronics/pull/3. Do not merge to `main` until final checks and owner review are complete.
- Supabase project: `bussiness website`, project ref `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- Migrations `initial_kundu_electronics_schema` and `add_public_catalogue_count` are applied.
- Live database: **158 published products, 17 published categories, 0 admin profiles**.
- The 21 public tables all have RLS enabled; two private storage buckets exist.
- Supabase has zero product-image rows; static approved photo assets are used for selected product SKUs.

## Catalogue and image state

- The shop reads the live published catalogue and shows exact filtered product counts. At 24 products per page, 158 products means seven pages; page numbers 1–7 are available without advancing first.
- The curated gallery has 33 SKU-matched products. Each SKU, name and product URL was checked against the live database.
- 16 photos supplied by the shop owner are included as individual WebP assets.
- 17 additional product photographs are included in an optimized sprite and matched to catalogue SKUs. Source, author and licence links are listed at `/image-credits`; 16 are CC BY-SA and one is CC0.
- The other 125 published products use clearly labelled, component-specific illustrations. Vendor/retailer images with unknown permission remain excluded.
- The gallery is a visual catalogue preview. Selling prices and stock labels still need final owner confirmation before sales are enabled.

## Enquiry-only customer flow

- The shopping cart works as a local saved cart.
- Checkout is disabled in `public.store_settings`.
- bKash and Nagad are both disabled; receiving numbers and customer instructions are null.
- No delivery zones are configured.
- The cart explains that checkout is unavailable; it does not simulate an order or payment.
- Order creation is guarded in both the database and API. Admin checkout activation also requires a configured delivery zone, payment instructions, `SUPABASE_SECRET_KEY` and a valid 64-character hex `APP_HMAC_SECRET`.
- No admin profile exists. Public registration is disabled. The owner must create an Auth account and explicitly assign an admin role before using protected admin pages.

## Security and CI

- RLS is enabled on all 21 public tables. Supabase security advisor warnings still require review.
- The last completed audit against the committed lockfile reported seven moderate, zero high and zero critical findings in the TypeScript-ESLint/minimatch development-tooling chain. The dry-run showed a compatible stable upgrade path to TypeScript-ESLint 8.73.0 and patched minimatch 11.x.
- Windows CI now contains a lockfile-remediation preview job that runs `npm audit`, typecheck, lint, tests and production build before uploading the preview lockfile. The latest run is pending; do not treat it as passed until job conclusions and the artifact are checked.
- Do not use `npm audit fix --force`, incompatible major overrides or prerelease tooling as a shortcut.

## Not launched

- No production hosting deployment has been completed.
- No production runtime environment variables have been configured in a hosting provider.
- No public production URL exists yet.
- The Vercel hosting integration is not currently connected for deployment from this chat.
- Supabase advisor warnings and the dependency-remediation CI result remain open.

## Hosting environment required

Configure these values only in the hosting provider's encrypted environment settings:

- `NEXT_PUBLIC_SUPABASE_URL=https://tcapxmiroikbsozvucmt.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — fetch the current key from Supabase Project Settings → API Keys.
- `SUPABASE_SECRET_KEY` — server-only Secret API key.
- `APP_HMAC_SECRET` — 32 cryptographically random bytes encoded as 64 hexadecimal characters.
- `NEXT_PUBLIC_SITE_URL` — the exact canonical origin assigned to production.

Never share server-only secrets in chat, issue comments, source control or build output. Set the site URL to the actual deployed origin.

## Owner confirmations required before selling

1. Review all 158 public selling prices, stock labels and product descriptions against the current business inventory.
2. Confirm approved delivery areas, charges and delivery policy.
3. Confirm bKash and/or Nagad receiving numbers and exact customer instructions.
4. Create the owner admin account in Supabase Auth and assign the correct role.
5. Configure hosting and server-only secrets, then verify checkout and order handling end-to-end on the production domain.
6. Confirm the final public photo set and attribution page.

The site can be published in enquiry-only mode once hosting and production configuration are complete. Do not enable payment, ordering or sales until the owner confirmations and live verification above are complete.
