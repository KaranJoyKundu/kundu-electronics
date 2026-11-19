# Kundu Electronics

Responsive electronics-components storefront for Kundu Electronics, Khulna, Bangladesh. Currency: BDT (৳).

## Current implementation

- Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
- Homepage with five-project horizontal carousel, founder story, /projects build showcase, searchable/filterable shop, product details, cart, contact, support and image credits.
- Live Supabase project provisioned in ap-northeast-1. The initial schema and public catalogue count migrations are applied.
- Live database currently has **208 published product rows across 18 categories**: 199 remaining original catalogue products (including P091) plus nine build-to-order robot kits. The other 12 resistor-named listings are archived.
- Shop search, category and BDT price filters use server-side catalogue queries. Pagination uses an exact filtered count; all nine pages (24 products per page) are available for the current catalogue.
- The optimized catalogue sprite retains photos for all **211 original inventory SKUs**. The owner confirmed permission/licensing for the complete supplied set; the 19 Creative Commons sources are attributed at `/image-credits`. Original product images are selected by SKU P001–P211. The nine robot-kit bundles use labelled project artwork where no kit-specific photograph was supplied.
- Supabase has 21 public tables with RLS enabled and two private storage buckets. Generated database types are in `src/lib/supabase/database.types.ts`.
- Protected admin routes cover products, categories, image uploads, variants, inventory, orders, payment verification and store settings. Public admin registration is disabled; an owner-provisioned Supabase user and role are required.

## Website orders, WhatsApp and delivery

- Website order requests are enabled. The checkout procedure uses server-authoritative current prices, delivery charges, quantity limits, stock locks and idempotency protection.
- Orders containing untracked/build-to-order items start at pending_stock_confirmation. The shop confirms stock and the delivery address before arranging payment.
- No online payment is collected. bKash and Nagad remain disabled because no verified receiving number or customer payment instructions have been supplied. Payment status starts as not_submitted; the site never marks an order paid automatically.
- Delivery choices: Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50). The shop confirms the address and whether the requested window can be met.
- WhatsApp order messages include one line per cart item in the form: product code - product name - unit price x quantity - line total, followed by delivery and the final Total: line. A click-to-call action is also available.
- P091 (1kΩ Resistor Box 5000pcs) is the only published resistor product and remains at its existing ৳1 price. The other 12 resistor-named records are archived, not deleted, preserving order history.
- Nine complete robot-kit bundles are published from the uploaded BOM sheet. The source calls their totals estimated costs, so the site labels them as estimates and confirms final scope/amount before payment. Bundles: LFR (৳4,999 / ৳7,499 / ৳9,999), Soccer Bot (৳3,999 / ৳9,999 / ৳14,999), RC Speed Battle (৳3,999 / ৳9,999 / ৳16,999). Their full BOMs are on each kit’s product page.
- Drone remains a custom project enquiry because the uploaded robot-kit list contains no drone BOM or price.
- One owner admin profile exists with the admin role and is linked to an email-confirmed Supabase Auth user. A successful sign-in and protected-page session still need owner verification.

## Hosting and deployment

- Production storefront: **https://kundu-electronics.vercel.app**
- Production branch: `main`.
- Latest verified production commit: `655030e3900823c8f2ceaf2ce3083c19ceea058b`.
- Vercel production deployment: `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb`, state **READY**, canonical alias verified.
- PR #11 merged on 19 November 2026: https://github.com/KaranJoyKundu/kundu-electronics/pull/11
- Windows CI run #188: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096
- Supabase project: `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- The live Supabase project has 208 published products across 18 categories, 220 total product rows (12 archived), 49 null selling prices, and six unknown availability states.
- Website order requests are enabled. Totals, prices, delivery charges and stock checks remain server-authoritative. Orders remain unpaid until the shop confirms stock/address and arranges payment.
- Standard delivery is configured as 12 hours–1 day / ৳0; Urgent is 30–60 minutes / ৳50. The shop confirms the destination and feasibility before promising either window.
- bKash and Nagad remain disabled. Their receiving numbers and instructions are unset, and no online payment is collected.
- Live database counts: zero orders and zero payment submissions.

Required hosting environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `APP_HMAC_SECRET` (server-only, 32 cryptographically random bytes encoded as 64 hex characters)
- `NEXT_PUBLIC_SITE_URL` (canonical production origin)

Never put server-only keys in client code, `NEXT_PUBLIC_*`, Git, build logs or chat. Keep bKash/Nagad disabled until verified owner-approved receiving details and instructions exist.

## Local setup

Run `npm ci`, copy `.env.example` to `.env.local`, configure the public Supabase environment values and start with `npm run dev`.

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and `npm audit` before merging.

## Project continuity

Read `START_HERE.md`, `documentation/PROJECT_STATE.md`, `documentation/LAUNCH_STATUS.md`, `documentation/PRODUCT_DATA_IMPORT.md` and `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`. Research notes are preserved in `documentation/research/`.

## Data protection

- Public records must contain customer-facing selling prices only.
- Never add purchase prices, margins, supplier identities, private stock notes, raw workbooks or credentials to public tables or the repository.
- Do not publish images whose reuse permission is unknown.
- Do not invent opening hours, delivery promises, policies, warranties or reviews.## Current CI security status

Windows CI run #188 on the production-readiness release passed clean install, TypeScript typecheck, lint, all 44 unit tests and the production build. The full `npm audit --json` check returned **0 critical, 0 high, 0 moderate and 0 low**; the separate `npm audit --omit=dev --json` check also returned **0 vulnerabilities**. The full audit job now fails on any future advisory, regardless of whether it is a development dependency.

The earlier GHSA-fc5q-39xc-vjpf / CVE-2026-112366 picomatch advisory was withdrawn by GitHub on 18 November 2026. See the [GitHub advisory record](https://github.com/advisories/GHSA-fc5q-39xc-vjpf). Do not retain the previous 14-high warning as current status; the current clean audit result is from the checked-in lockfile on CI run #188.

Supabase Auth leaked-password protection remains disabled. This is a dashboard-level owner setting and must be enabled by the owner if the project's plan includes the feature. Supabase's current documentation says the HaveIBeenPwned-backed password protection is available on Pro and above.

The Supabase database hardening migration added 11 foreign-key indexes and narrowed anonymous execution of internal role-introspection functions. RLS is enabled on all 21 public tables. The private rate-limit table intentionally has no client policies/grants and is only accessed through a service-role RPC.

## Local setup

Run `npm ci`, copy `.env.example` to `.env.local`, configure the public Supabase environment values and start with `npm run dev`.

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and `npm audit` before merging.

## Project continuity

Read `START_HERE.md`, `documentation/PROJECT_STATE.md`, `documentation/LAUNCH_STATUS.md`, `documentation/PRODUCT_DATA_IMPORT.md` and `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`. Research notes are preserved in `documentation/research/`.

## Data protection

- Public records must contain customer-facing selling prices only.
- Never add purchase prices, margins, supplier identities, private stock notes, raw workbooks or credentials to public tables or the repository.
- Do not publish images whose reuse permission is unknown.
- Do not invent opening hours, delivery promises, policies, warranties or reviews.
