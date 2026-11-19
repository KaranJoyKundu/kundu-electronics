# Launch status — 19 November 2026

## Production

- Storefront: **https://kundu-electronics.vercel.app**
- Production branch: `main`.
- Last verified production baseline before the current hardening PR: commit `528844c918aaa5a75fdfc83550ac8cd68922b8ba`.
- Vercel deployment `dpl_6Pg7wz4c3NFqSUvZhfri7jv9kVJ7` was **READY** and aliased to the canonical domain.
- Current hardening work is on `chore/production-readiness-hardening`; do not call it production until the PR is merged and the matching Vercel deployment is READY.

## Live catalogue facts from Supabase

- 208 published products across 18 published categories.
- 199 published original SKU rows plus nine project-kit rows.
- 12 original resistor-named rows are archived and retained.
- 220 total product rows (208 published + 12 archived).
- Published price state: 49 items have no verified selling price.
- Published availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order, six unknown.
- No stock counts are shown publicly. No missing selling prices are inferred.
- The full original P001–P211 photo set remains in the repository. The approved 211-SKU static photo sprite is used for catalogue imagery where a local product image exists.

## Orders, delivery and payment

- Supabase `store_settings.checkout_enabled=true`.
- Website order requests are enabled and remain unpaid until the shop confirms stock/address and arranges payment.
- Server code calculates product prices, delivery amounts and order totals; idempotency and stock reservation logic remain in the existing database RPC.
- Delivery options in Supabase: Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50). The shop still confirms destination and feasibility.
- bKash and Nagad are both disabled. Their receiving numbers and customer instructions are null.
- Live database count at audit time: **0 orders, 0 payment submissions**.

## Security status

- RLS is enabled on all 21 public tables.
- `rate_limit_windows` deliberately has no anon/authenticated policy or grants; it is accessed only through the service-role `consume_rate_limit` function.
- A new migration added indexes for 11 previously unindexed foreign keys and removed anonymous EXECUTE from role introspection helpers. Authenticated execute remains only where RLS or protected server operations require it; those SECURITY DEFINER functions contain role checks.
- Supabase advisors still report expected SECURITY DEFINER exposure for safe public catalogue/config functions and authenticated role-guarded operational RPCs. These warnings are documented; do not call them zero findings.
- Supabase Auth leaked-password protection remains disabled. This is an owner/dashboard action and requires a Supabase plan that includes the feature (current Supabase docs state Pro and above).
- The complete npm audit on the previous workflow run reported 14 high, 0 moderate, 0 low and 0 critical findings. The affected `picomatch <=4.0.7` chain was classified as development-only; no patched stable release was available in the checked npm registry. The hardening workflow now distinguishes a production-only `npm audit --omit=dev` from the full dependency audit. Only the new workflow result can establish the current graph status.
- Security headers were added in Next.js configuration; verify them from the deployed response after release.

## Verified routes and limits of this audit

The preceding production check received HTTP 200 for the homepage, shop, projects, cart, about, contact, support, gallery, image credits, shipping/returns, admin sign-in, product detail, project detail pages, `/robots.txt` and `/sitemap.xml`. This was an HTTP/SSR smoke test, not a full interactive Playwright or desktop/mobile visual test.

Search for “breadboard” returned both breadboard products; a one-character “b” search needed a related Breadboard suggestion and the code change is included in the hardening branch. The ৳0–৳200 price-filter API returned matching products.

## Owner verification still required

1. Sign in through `/admin/login` using the owner's email link and verify protected admin pages.
2. Physically verify stock and resolve the six unknown availability records.
3. Supply approved customer-facing selling prices for the 49 unpriced records.
4. Enable bKash/Nagad only after exact receiving numbers and instructions are supplied and the owner explicitly approves activation.
5. Confirm delivery feasibility per address before promising a window.
6. Enable Supabase leaked-password protection in Auth settings if the project's plan includes it.
7. Complete real-browser desktop/mobile interaction and accessibility testing. HTTP status checks alone do not establish visual or interactive correctness.

Do not claim zero vulnerabilities or full production readiness while any security advisories, owner blockers or untested release criteria remain.
