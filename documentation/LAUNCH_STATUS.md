# Launch status — 19 November 2026

## Production deployment

- Storefront: **https://kundu-electronics.vercel.app**
- Production branch: `main`.
- Latest production commit: `655030e3900823c8f2ceaf2ce3083c19ceea058b`.
- Vercel deployment: `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb`, state **READY**, alias includes the canonical domain.
- Production-readiness PR #11: https://github.com/KaranJoyKundu/kundu-electronics/pull/11 (merged).
- Windows CI run #188: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096 (all required jobs succeeded).

## Live catalogue facts from Supabase

- 208 published products across 18 published categories.
- 199 published original SKU rows plus nine project-kit rows.
- 12 original resistor-named rows are archived and retained.
- 220 product rows total.
- 49 published products have no confirmed selling price.
- Availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order and six unknown.
- No stock counts are shown publicly. No missing selling prices are inferred.

## Orders, delivery and payment

- Supabase `store_settings.checkout_enabled=true`.
- Website order requests are enabled and remain unpaid until the shop confirms stock/address and arranges payment.
- Server/database calculates item pricing, delivery, stock status and totals; idempotency and stock reservation logic remain server-side.
- Standard delivery: 12 hours–1 day / ৳0. Urgent: 30–60 minutes / ৳50. The shop confirms destination and feasibility before promising a window.
- bKash and Nagad are enabled in `payment_method_settings`; both use the owner-provided receiving number **01735530174** and shared customer instructions retrieved through `get_public_checkout_config()`.
- Checkout UI changes in `feat/checkout-payment-options` add Cash on delivery vs Online payment, bKash/Nagad selection, TrxID submission, referral/reference and suggestions. They remain pending CI/preview verification and are not yet on production.
- Online payment is manual transfer only. A submitted TrxID remains `pending_verification`; only an authorized administrator can verify it. No gateway or automatic payment verification is enabled.
- Orders with untracked/build-to-order items remain `pending_stock_confirmation`; customers must wait for stock and final amount confirmation before paying.
- Live database count: **0 orders, 0 payment submissions**.

## Security and dependency verification

Windows CI run #188 on 19 November 2026:
- Clean `npm ci`: success.
- TypeScript typecheck: success.
- ESLint: success.
- Node test suite: **44 passed, 0 failed**.
- Production build: success.
- Full `npm audit --json`: **0 total** (0 critical, 0 high, 0 moderate, 0 low).
- Production-only `npm audit --omit=dev --json`: **0 total** (0 critical, 0 high, 0 moderate, 0 low).

The former picomatch GHSA-fc5q-39xc-vjpf / CVE-2026-112366 advisory was withdrawn by GitHub on 18 November 2026: https://github.com/advisories/GHSA-fc5q-39xc-vjpf. The current lockfile audit is clean; the workflow now fails on any future finding in either development or production dependencies.

Live Supabase hardening applied by migration `20261119094342_security_and_fk_index_hardening`:
- 11 foreign-key indexes added.
- Anonymous execution removed from internal role-helper functions.
- Direct helper execution grants retained only for authenticated users where RLS policies require them.
- `rate_limit_windows` remains intentionally private with no direct client policies/grants.

Supabase Auth leaked-password protection is still disabled. The owner must enable it in Auth settings if their plan includes the feature; the current Supabase docs say this HaveIBeenPwned-backed option is Pro and above.

Supabase advisors still surface generic notices for intended SECURITY DEFINER public read helpers, role-protected authenticated functions, the private rate-limit table and multiple permissive policies. The function grants and role checks were reviewed, but these advisor notices are not represented as all cleared. Review them with workload-specific context before any policy consolidation.

## Production smoke verification

The canonical production domain returned HTTP 200 for the homepage, shop, projects, LFR, Soccer Bot, RC Speed Battle, Drone, image credits, `/robots.txt`, and `/sitemap.xml`.

Verified:
- Security response headers: nosniff, frame denial, strict-origin Referrer-Policy, restrictive Permissions-Policy and HSTS.
- Search `b` returns P079 and P080 Breadboard suggestions first.
- Search `breadboard` returns the two Breadboard products.
- Price-filter API `min=0&max=200` returns matching products.
- Product and Bee optimized image URLs return image/jpeg or image/png responses.
- Individual LFR, Soccer and RC kit product detail routes return HTTP 200.
- Drone artwork contains an original concept illustration and does not claim a verified BOM/build photograph.

This is HTTP/SSR/network smoke verification, not a full interactive Playwright or manual mobile visual review.

## Owner verification still required

1. Open `/admin/login` with the owner's email magic link and verify all protected admin pages in a browser.
2. Physically verify six unknown stock records and reconfirm current in-stock/low-stock states.
3. Confirm the 49 missing customer selling prices.
4. Re-confirm that 01735530174 is still the correct business receiving number before accepting real customer transfers; do not ask customers to pay for untracked kits until stock is confirmed.
5. Confirm delivery feasibility for each address before promising a delivery window.
6. Enable Supabase leaked-password protection in Auth settings if the plan includes it.
7. Complete interactive desktop/tablet/mobile browser QA, accessibility audit and Lighthouse measurements. The current checks do not prove every interactive state at each requested viewport.
8. Review the remaining Supabase advisor notices around overlapping policies and real index usage.

Do not claim absolute zero possible vulnerabilities. The current npm audit has no known findings; Auth hardening and the owner/browser tasks above remain outstanding.
