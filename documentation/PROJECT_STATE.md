# PROJECT_STATE — Kundu Electronics

**Last verified:** 20 November 2026 (Asia/Dhaka)  
**Repository:** `KaranJoyKundu/kundu-electronics` (private)  
**Production branch:** `main`  
**Production URL:** https://kundu-electronics.vercel.app  
**Production commit:** `4dc2862d2fe21bcaf89cc0ce9cb7daed5b4653a9`  
**Vercel deployment:** `dpl_7fbo8M32JhQnum6eyuwo2doLGiY5` (**READY**)  
**Merged release PRs:** #11 (hardening), #13 (photo restoration), #14 (checkout/payment), #15 (7–14 day pre-orders)  
**Supabase project:** `tcapxmiroikbsozvucmt` (ap-northeast-1)

## Objective

Operate an accurate, safe, useful electronics-components storefront for Kundu Electronics in Khulna, Bangladesh. Currency is BDT (৳). SparkFun informs product-discovery patterns only; Kundu's branding and verified business facts take precedence.

## Architecture

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Modular monolith hosted on Vercel.
- Supabase PostgreSQL, Auth and Storage.
- Separate browser/server/public/privileged Supabase clients; privileged server client is marked `server-only`.
- `src/proxy.ts` refreshes Auth cookies; protected admin pages and server actions verify current user and store role.
- Public business settings live in `src/config/business.ts`.
- Public product records contain customer-facing selling prices only; purchase cost, margin, supplier and private stock notes stay outside public tables and types.
- Money is represented as whole BDT in PostgreSQL BIGINT values.

## Current live data

Verified by read-only Supabase queries on 19 November 2026:

| Item | Value |
|---|---:|
| Product rows total | 220 |
| Published products | 208 |
| Archived products | 12 |
| Published categories | 18 |
| Published original SKU products | 199 |
| Published robot kits | 9 |
| Published products without confirmed selling price | 49 |
| In stock | 117 |
| Low stock | 34 |
| Out of stock | 42 |
| Build to order | 9 |
| Availability unknown | 6 |
| Orders | 0 |
| Payment submissions | 0 |

The 199 published original products plus 12 archived source SKUs reconcile to the original P001–P211 source set. Nine project-kit bundle rows are additional products. P091 remains published; other resistor-named rows are archived rather than deleted.

## Implemented storefront capabilities

- Homepage and project showcase, shop catalogue, product detail pages, cart, contact, support, about, gallery, image credits and shipping/returns.
- Server-side catalogue search, category and BDT price filters, sorting and exact-count pagination.
- Autocomplete is debounced, aborts stale fetches, and now supports keyboard selection; a one-character `b` query returns both Breadboard SKUs first.
- Local SKU product imagery is selected from the approved image mapping. Project collages use approved component imagery and are not presented as completed builds. Bee uses owner project photos. Drone is clearly labelled as a concept illustration until a verified BOM/build photo exists.
- Product and Bee imagery use Next image optimization; only the explicit Bee case-study image host was added to the image allowlist.
- Cart persists locally; server-side product/order data remains authoritative.
- Website creates unpaid order requests. Server/database calculates price, delivery charge, stock state and total; idempotency and stock reservation logic remain server-side.
- Checkout offers Cash on delivery or Online payment. Online payment uses the existing authenticated order-payment submission endpoint; transaction references remain unverified until staff review.
- Protected admin sections exist for products, categories, images, variants, stock, orders, payments and settings.

## Current live checkout configuration

- Supabase `checkout_enabled=true`; website order requests are active.
- Standard delivery: 12 hours–1 day, ৳0. Urgent: 30–60 minutes, ৳50.
- The shop confirms the exact address and whether a delivery window can be met.
- bKash and Nagad are enabled in `payment_method_settings`, both using the owner-provided receiving number `01735530174`. Public checkout configuration exposes these settings through the existing `get_public_checkout_config()` RPC.
- Checkout offers Cash on delivery and Online payment. Online customers select bKash or Nagad, send the exact server-calculated order total, cover any applicable wallet/service charge displayed by the provider, and submit sender number plus TrxID.
- Nine untracked/build-to-order project kits and 26 priced out-of-stock products are available to pre-order now. Their next stock drop is expected in 7–14 days. The remaining 16 out-of-stock products have no published selling price and remain unavailable. Pre-orders remain at `pending_stock_confirmation` until stock arrives; the arrival action then reserves tracked quantities and unlocks online payment through `awaiting_payment`. No separate final-price confirmation is required. In-stock-only orders can be paid immediately.
- Cash-on-delivery preference, referral/reference and suggestions are recorded in the order's customer note. COD orders do not submit transaction references.
- The order-payment endpoint creates a `pending_verification` submission only. An authorized admin must verify it before payment status can become `verified`.
- One pre-existing LFR-T2 pre-order is pending stock arrival; no payment submissions exist. It was preserved unchanged during this rollout.
- Never treat a submitted transaction reference as proof of payment.

## Security and dependency status

- Windows CI run #188 passed clean install, typecheck, lint, 44 tests and production build.
- Full `npm audit --json`: 0 critical, 0 high, 0 moderate, 0 low.
- Production-only `npm audit --omit=dev --json`: 0 findings.
- CI now fails if any known vulnerability appears in the complete dependency tree. Evidence: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096
- The former GHSA-fc5q-39xc-vjpf / CVE-2026-112366 advisory for picomatch was withdrawn by GitHub on 18 November 2026: https://github.com/advisories/GHSA-fc5q-39xc-vjpf
- RLS is enabled on all 21 public tables.
- `rate_limit_windows` deliberately has no client policies or grants; only the service-role `consume_rate_limit` RPC accesses it.
- Direct execute on `has_store_role(admin_role[])` was revoked for PUBLIC, anon and authenticated. Anonymous execute on `is_store_admin()` and `is_store_staff()` was revoked; authenticated wrapper access remains for RLS policies.
- Eleven previously unindexed foreign-key columns have indexes via migration `20261119094342_security_and_fk_index_hardening`.
- Public catalogue/count/config functions remain SECURITY DEFINER read-only helpers; authenticated operational functions contain staff/admin checks; checkout/guest-order/rate-limit functions remain service-role-only.
- Supabase Auth leaked-password protection remains disabled. It must be enabled by the owner in the Supabase dashboard if the plan includes it.
- Browser headers verified in production: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.
- No claim is made that the application is immune to unknown vulnerabilities. npm audit and the database advisor are evidence for the checks described above, not a proof of zero possible security defects.

## CI, deployment and release

- PR #11 merged to main as commit `655030e3900823c8f2ceaf2ce3083c19ceea058b`.
- Windows CI #188 passed all application, full-audit and production-audit jobs: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096
- Vercel deployment `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb` is READY and canonical alias verified.
- A Vercel preview of the same commit was READY before merge; route, autocomplete, price-filter, image and security-header smoke checks passed.
- Full interactive Playwright/Lighthouse checks across desktop/tablet/mobile were not run in this tool session. SSR/status checks do not replace that browser-based QA.

## Remaining owner-controlled blockers and unverified tasks

1. Confirm the 49 missing customer-facing selling prices; do not invent values.
2. Physically verify six unknown stock records and re-confirm current in-stock/low-stock values.
3. Verify the owner's magic-link sign-in and protected admin browser session.
4. Enable leaked-password protection in Supabase Auth if the plan includes it; the project owner must change this dashboard setting.
5. Keep the bKash/Nagad receiving number and wallet instructions current; re-confirm the receiving number with the owner before any future change.
6. Approve any changed delivery, policy, warranty or terms statements.
7. Supply/approve actual project build photos and rights for any new external photography.
8. Complete full interactive browser QA, screenshots and Lighthouse at 1440×900, 1366×768, 768×1024, 390×844 and 360×800.
9. Review remaining Supabase advisor notices for overlapping permissive policies and index usage under real workload. Role helper and FK index hardening is applied; not every generic advisor notice is a confirmed vulnerability.

## Operational prohibitions

- Do not expose secret/service-role keys or APP_HMAC_SECRET.
- Do not create test orders, submit payments or modify real stock in production.
- Do not delete historical orders or archived product records.
- Do not publish purchase cost, margin, suppliers, private stock notes or the owner's source workbook.
- Do not claim zero vulnerabilities beyond the exact zero-finding npm audit run. Unknown vulnerabilities cannot be ruled out.
