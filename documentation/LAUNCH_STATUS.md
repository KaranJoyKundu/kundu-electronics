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

- RLS is enabled on all 21 public tables. Supabase security-advisor warnings still require review.
- Latest Windows audit run #44135310151 reported **15 development-tooling findings: 9 high, 6 moderate, 0 critical**. The direct package in the affected chain is `eslint-config-next@16.4.6` (a devDependency); the remaining findings are transitive lint-tool dependencies.
- The new high advisory is GHSA-fc5q-39xc-vjpf in `picomatch <=4.0.7`; upstream PR #238 was still open and npm's latest published package remained 4.0.7 at the time of review. The moderate minimatch advisory GHSA-g3hv-75wg-m249 is also still present.
- The Windows app-verification job **passed** (typecheck, lint, tests, production build). The security audit and lockfile-remediation preview **failed**; no lockfile candidate was committed. npm's suggested force path would downgrade `eslint-config-next` from 16.4.6 to 14.2.35. It was not used.
- Keep PR #3 in draft. Do not force a major downgrade, add an incompatible override, use an unreviewed Git dependency or suppress the audit. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md` for the full report and artifact links.

## Vercel hosting state

- Existing Vercel project: `kundu-electronics` (`prj_Rjsn0UkM5UbbFmdILo6wSHYe0JWD`) in the connected team.
- Vercel has a verified project domain `kundu-electronics.vercel.app`. The most recent production-target deployment currently associated with that domain is an older READY deployment from commit `90f70e160350d5dc2c921c52d7b21f2d6ae569f0`. It was not replaced during this work.
- A separate **READY preview deployment** was created for current feature-branch commit `9230e23e63cb07a8a612c8500f6f2dab2377ac2d`:
  https://kundu-electronics-31lo99v7o-kundu2409056-5098.vercel.app
- The preview has its own branch alias and did not receive the production domain. The preview build ran Next.js 16.4.6 and completed successfully.
- The Vercel project has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL` set. The sensitive values for `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` are currently blank. They were not read or changed.
- Checkout therefore remains disabled; no secret was inserted into Vercel or Git.

The existing production-target deployment is older than the current feature preview. Do not promote the new preview or change the production alias until the audit, owner inventory review and remaining launch checks are resolved. The preview can be opened for visual inspection at the URL above.

## Remaining launch blockers

- Windows dependency security audit is not clean (see above).
- Product prices, availability and descriptions need final owner review against the current inventory.
- bKash/Nagad receiving details and instructions, delivery zones and charges are not configured.
- No owner admin profile exists.
- Server-only Vercel secrets are blank.
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
4. Create the owner admin account in Supabase Auth and assign the correct role.
5. Configure hosting and server-only secrets, then verify checkout and order handling end-to-end on the production domain.
6. Confirm the final public photo set and attribution page.

The site can be published in enquiry-only mode once hosting and production configuration are complete. Do not enable payment, ordering or sales until the owner confirmations and live verification above are complete.
