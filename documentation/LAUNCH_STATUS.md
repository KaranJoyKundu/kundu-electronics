# Launch status — 18 November 2026

## Verified implementation

- PR #1 was squash-merged into `main` on 13 November 2026. Merge commit: `7f2a448426fb78f4467eaa377af8489f115c427a`.
- Current launch work is isolated on `feat/launch-prep`. Draft PR #3: https://github.com/KaranJoyKundu/kundu-electronics/pull/3. Do not merge to `main` until final checks and owner review are complete.
- Supabase project: `bussiness website`, project ref `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- Migrations `initial_kundu_electronics_schema` and `add_public_catalogue_count` are applied.
- Live database: **158 published products, 17 published categories and 1 admin profile**. The admin profile is linked to an Auth user with a confirmed email; successful sign-in has not yet been tested.
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
- One `admin` profile (the UID supplied by the owner) is linked to an email-confirmed Supabase Auth user. Supabase reports no successful sign-in yet; test the sign-in flow and protected admin session before using the portal operationally.

## Security and CI

- RLS is enabled on all 21 public tables. Supabase security-advisor warnings still require review.
- Stable TypeScript-ESLint `8.73.0` and nested `minimatch@11.0.9` are committed in feature-branch commit `f29d1887bd336ee95a124469d8b54f43d82d963c`. Next.js and `eslint-config-next` remain at `16.4.6`.
- Latest Windows run #44190035964 passed the application verification lane and stable-tooling candidate lane: clean install, audit classification, typecheck, lint, tests and production build all passed.
- The updated candidate audit has **14 high, 0 moderate and 0 critical** findings. All remaining nodes were verified as development-only tooling. The unresolved high advisory is GHSA-fc5q-39xc-vjpf in `picomatch <=4.0.7`; the ordinary audit lane therefore still reports failure and must not be described as security-clean.
- Keep PR #3 in draft. Do not downgrade the Next.js ESLint config, add incompatible overrides, use an unreviewed Git dependency or suppress the audit. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md` for the full report and artifact links.

## Vercel production state

- Production site is live at **https://kundu-electronics.vercel.app**.
- Production deployment: `dpl_9eR2LheoHs1uX6obvbEsCswC2ayy`, status **READY**, source `feat/launch-prep` commit `e8735cf5950a27bb1bd512397dbb16b79c5fa808`.
- Vercel confirms the canonical alias `kundu-electronics.vercel.app` maps to that deployment. This replaces the previous production-target deployment from commit `90f70e160350d5dc2c921c52d7b21f2d6ae569f0`.
- Separate READY preview: https://kundu-electronics-58i018i2w-kundu2409056-5098.vercel.app
- The production build generated the shop, product, gallery, image-credits, cart, checkout API and protected admin routes. Direct HTTP fetching from this execution environment was blocked by DNS resolution, so owner browser visual confirmation remains outstanding.
- Vercel has the public Supabase URL/key and canonical URL entries. Sensitive `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` entries are present in protected form; their values are not exposed in this documentation.
- Live Supabase checks show `checkout_enabled = false`, zero enabled payment methods and zero configured delivery zones. Customers can browse and send WhatsApp enquiries; they cannot place or pay for orders.

The site is now deployed in enquiry-only mode. Do not enable payments or checkout until prices/stock are owner-reviewed, delivery areas/charges and payment instructions are configured, the admin sign-in is tested, and the remaining high-severity development-tooling advisory has a stable fix.

## Remaining launch blockers

- Windows dependency security audit is not clean (see above).
- Product prices, availability and descriptions need final owner review against the current inventory.
- bKash/Nagad receiving details and instructions, delivery zones and charges are not configured.
- Supabase security-advisor warnings still need review.

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
4. Test the provisioned admin Auth account by signing in and verifying access to the protected admin pages.
5. Configure hosting and server-only secrets, then verify checkout and order handling end-to-end on the production domain.
6. Confirm the final public photo set and attribution page.

The site can be published in enquiry-only mode once hosting and production configuration are complete. Do not enable payment, ordering or sales until the owner confirmations and live verification above are complete.
