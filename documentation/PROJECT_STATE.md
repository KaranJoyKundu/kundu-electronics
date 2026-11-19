# PROJECT_STATE — Kundu Electronics

**Last verified:** 19 November 2026 (Asia/Dhaka)  
**Repository:** `KaranJoyKundu/kundu-electronics` (private)  
**Production branch:** `main`  
**Production URL:** https://kundu-electronics.vercel.app  
**Last verified production baseline before hardening release:** `528844c918aaa5a75fdfc83550ac8cd68922b8ba`  
**Hardening branch:** `chore/production-readiness-hardening`  
**Supabase project:** `tcapxmiroikbsozvucmt` (ap-northeast-1)

## Objective

Operate an accurate, safe, useful electronics-components storefront for Kundu Electronics in Khulna, Bangladesh. Currency is BDT (৳). SparkFun informs product-discovery patterns only; Kundu's branding and verified business facts take precedence.

## Architecture

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Modular monolith hosted on Vercel.
- Supabase PostgreSQL, Auth and Storage.
- Separate browser/server/public/privileged Supabase clients; privileged server client is marked `server-only`.
- `src/proxy.ts` refreshes Auth cookies; protected admin pages and server actions verify the current user and store role.
- Public business settings live in `src/config/business.ts`.
- Public product records contain customer-facing prices only; purchase cost, margin, supplier and private stock notes stay outside public tables and types.
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
- Autocomplete is debounced, aborts stale fetches and now supports keyboard selection; a one-character `b` query includes the Breadboard matches.
- Local SKU product imagery is selected from the approved image mapping. Project collages use approved component imagery and are not described as completed builds. Bee uses owner project photos. Drone is clearly marked as a concept illustration until verified BOM/photo exists.
- Cart persists locally and server-side product/order data remains authoritative.
- Website creates unpaid order requests. Server/database calculates price, delivery charge, stock state and total; idempotency and stock reservation logic remain server-side.
- Manual payment submission and verification are distinct. bKash/Nagad are not enabled.
- Protected admin sections exist for products, categories, images, variants, stock, orders, payments and settings.

## Current live checkout configuration

- Supabase `checkout_enabled=true`; website order requests are active.
- Standard delivery: 12 hours–1 day, ৳0. Urgent: 30–60 minutes, ৳50.
- The shop confirms the exact address and whether a delivery window can be met.
- bKash and Nagad are disabled; receiving number and customer instructions are unset.
- No orders or payment submissions currently exist.
- Never treat a submitted transaction reference as proof of payment.

## Security and data protection

- RLS is enabled on all 21 public tables.
- `rate_limit_windows` deliberately has no client policies or grants; only the service-role `consume_rate_limit` RPC accesses it.
- Public role-introspection helper grants have been narrowed. Authenticated users retain execute permission for `is_store_admin` / `is_store_staff` as required by RLS policies. `has_store_role` itself is no longer directly executable by anon/authenticated.
- Privileged stock/order/payment SECURITY DEFINER functions remain accessible to authenticated only where required and contain explicit staff/admin guards; payment verification checks admin role. Checkout/guest-order/rate-limit functions remain service-role-only.
- Eleven foreign-key indexes reported missing by Supabase performance advisor were added in migration `20261119094342_security_and_fk_index_hardening`.
- Baseline browser security headers are configured in `next.config.ts`. A restrictive CSP has not been added; Next.js inline-script/nonced-CSP compatibility needs dedicated browser testing first.
- Supabase advisor still reports intended public safe SECURITY DEFINER functions, role-protected authenticated RPCs, the intentionally policy-less rate-limit table and overlapping policies. Treat these as reviewed findings, not as a claim of zero advisories.
- Supabase Auth leaked-password protection remains disabled. It is a project Auth setting and must be enabled by an owner if the Supabase plan includes it.
- Full npm audit last reported 14 high findings and 0 moderate/low/critical. The audited nodes were development-only; the exact shipped dependency graph must be established by the new CI `npm audit --omit=dev` lane. Never claim the whole dependency tree is clean until the full audit is clear.

## CI, deployment and release rules

- Windows CI must run on PRs targeting `main` and on pushes to `main`.
- Node 24 actions are pinned to verified immutable commit SHAs.
- Application checks: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Dependency checks: complete `npm audit` with dev findings visible, and separate `npm audit --omit=dev` for production dependencies.
- Do not merge or deploy if application checks fail or runtime dependencies have known advisories.
- Confirm Vercel production deployment source SHA and READY state after every release.

## Remaining owner-controlled blockers

1. Confirm the 49 missing customer-facing selling prices; do not invent values.
2. Physically verify six unknown stock records and re-confirm current in-stock/low-stock values.
3. Verify the owner's magic-link sign-in and protected admin browser session.
4. Enable leaked-password protection in Supabase Auth if the plan includes it; connector access cannot toggle this Auth setting.
5. Supply exact receiving numbers and approved instructions before enabling bKash/Nagad.
6. Approve any changed delivery/policy/warranty/terms statements.
7. Supply or approve actual project build photos and any new photo rights.
8. Complete interactive browser QA at desktop/tablet/mobile viewports; HTTP/SSR checks are not a substitute.

## Operational prohibitions

- Do not expose secret/service-role keys or APP_HMAC_SECRET.
- Do not create test orders, submit payments, or modify real stock in production.
- Do not delete historical orders or archived product records.
- Do not publish purchase cost, margin, suppliers, private stock notes or the owner's source workbook.
- Do not claim zero vulnerabilities or full launch readiness while unresolved advisories or owner blockers remain.
