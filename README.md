# Kundu Electronics

Responsive electronics-components storefront for Kundu Electronics, Khulna, Bangladesh. Currency: BDT (৳).

## Current implementation

- Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
- Homepage with a five-project horizontal carousel, founder story, project showcase, searchable/filterable shop, product details, cart, contact, support and image credits.
- Live Supabase project provisioned in ap-northeast-1. The initial schema and public catalogue count migrations are applied.
- Live database currently has **208 published product rows across 18 categories**: 199 remaining original catalogue products (including P091) plus nine build-to-order robot kits. The other 12 resistor-named listings are archived.
- Shop search, category and BDT price filters use server-side catalogue queries. Pagination uses an exact filtered count; all nine pages (24 products per page) are available for the current catalogue.
- The optimized catalogue sprite retains photos for all **211 original inventory SKUs**. The owner confirmed permission/licensing for the complete supplied set; the 19 Creative Commons sources are attributed at `/image-credits`. Original product images are selected by SKU P001–P211.
- Supabase has 21 public tables with RLS enabled and two private storage buckets. Generated database types are in `src/lib/supabase/database.types.ts`.
- Protected admin routes cover products, categories, image uploads, variants, inventory, orders, payment verification and store settings. Public admin registration is disabled; an owner-provisioned Supabase user and role are required.

## Project showcase and catalogue imagery

- The `PROJECTS / LIVE BUILDS` showcase displays the Bee Biped owner case-study photo and clearly labelled external reference photos for Line Follower, Soccer Bot, RC Speed Battle and Drone. The external pictures are examples/reference imagery, not proof that those exact robots were built by Kundu Electronics.
- The reference image sources are linked beside the project artwork: MakerWorks Lab (Line Follower), the RoboBox-4 product listing (Soccer Bot), Hackster.io (RC Speed Battle) and Instructables (Drone).
- Under `SHOP PICKS → From the catalogue`, the kit-photo fallback reuses the same source image used by its matching project showcase card: LFR Tier 1/2/3 → Line Follower; Soccer Bot Tier 1/2/3 → Soccer Bot; RC Tier 1/2/3 → RC Speed Battle.
- An uploaded product image or an existing SKU-specific catalogue image takes precedence. The shared project reference photo is used when a kit has no dedicated image.
- Kit cards identify these as the same project reference photo. Do not describe reference photos as owner build photos or verified kit contents.

## Website orders, WhatsApp and delivery

- Website order requests are enabled. The checkout procedure uses server-authoritative current prices, delivery charges, quantity limits, stock locks and idempotency protection.
- Orders containing untracked/build-to-order items start at `pending_stock_confirmation`. The shop confirms stock and the delivery address before arranging payment.
- Checkout offers **Cash on delivery** and **Online payment**. bKash and Nagad are configured to the owner-provided receiving number **01735530174**.
- For online payment, customers select bKash or Nagad, send the exact server-calculated order total, cover any applicable wallet/provider charge shown in their app (without deducting it from the order amount), and submit their sender number plus transaction ID (TrxID).
- Orders containing untracked/build-to-order items remain at `pending_stock_confirmation`; customers must wait for the shop to confirm stock and the final amount before transferring money. The payment form becomes available only when the order is `awaiting_payment`.
- Cash-on-delivery preference, referral/reference and customer suggestions are saved with the order note. COD does not ask for a transaction ID.
- A submitted transaction reference creates a `pending_verification` payment submission. It is never treated as proof of payment; only an authorized shop administrator can verify it and mark the payment as verified.
- Delivery choices: Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50). The shop confirms the address and whether the requested window can be met.
- WhatsApp order messages include one line per cart item in the form: product code - product name - unit price x quantity - line total, followed by delivery and the final Total: line. A click-to-call action is also available.
- P091 (1kΩ Resistor Box 5000pcs) is the only published resistor product and remains at its existing ৳1 price. The other 12 resistor-named records are archived, not deleted, preserving order history.
- Nine complete robot-kit bundles are published from the uploaded BOM sheet. The source calls their totals estimated costs, so the site labels them as estimates and confirms final scope/amount before payment. Bundles: LFR (৳4,999 / ৳7,499 / ৳9,999), Soccer Bot (৳3,999 / ৳9,999 / ৳14,999), RC Speed Battle (৳3,999 / ৳9,999 / ৳16,999). Their full BOMs are on each kit’s product page.
- Drone remains a custom project enquiry because the uploaded robot-kit list contains no drone BOM or price.
- One owner admin profile exists with the admin role and is linked to an email-confirmed Supabase Auth user. A successful sign-in and protected-page session still need owner verification.

## Hosting and deployment

- Production storefront: **https://kundu-electronics.vercel.app**
- Production branch: `main`.
- PR #11 (production-readiness hardening), PR #13 (project reference photo restoration) and PR #14 (checkout payment choices) are merged.
- PR #13 merge commit: `132216da28623405bd8411d381a88cf4fc968988`.
- PR #14 merge commit: `cf45e25cc1fcd0a956a57e412806bf80674677e2`.
- PR #14 Windows CI run #207 passed typecheck, lint, tests, production build and both dependency audits: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44638048525.
- PR #14 preview deployment reached **READY**: [checkout preview](https://kundu-electronics-2s7qx1x0k-kundu2409056-5098.vercel.app).
- Latest verified production rollout after PR #14: Vercel deployment `dpl_FZLGsPFyPPeSbPgAJ6JizoSr9Kgi`, commit `cf45e25cc1fcd0a956a57e412806bf80674677e2`, state **READY**; canonical alias `https://kundu-electronics.vercel.app` verified. Production `/cart`, `/shop` and `/projects` returned HTTP 200.
- Supabase project: `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- The live Supabase project has 208 published products across 18 categories, 220 total product rows (12 archived), 49 null selling prices, and six unknown availability states.
- Website checkout offers **Cash on delivery** and **Online payment**. Both bKash and Nagad are enabled with the owner-provided number `01735530174`. Prices, delivery charges and stock checks remain server-authoritative.
- Online payments are manual transfers: customers select bKash/Nagad, send the exact order total, cover any provider charge shown in their app separately, and submit sender number plus TrxID. Submissions remain `pending_verification` until an authorized admin verifies them.
- Orders needing manual stock confirmation must wait for staff confirmation and the final amount before online payment is submitted. COD orders do not request a transaction ID; referral/reference and suggestions are saved with the order note.
- Standard delivery is configured as 12 hours–1 day / ৳0; Urgent is 30–60 minutes / ৳50. The shop confirms the destination and feasibility before promising either window.
- bKash and Nagad are configured with `01735530174`; no payment gateway/API integration or automatic verification is enabled.
- Live database counts: zero orders and zero payment submissions.

Required hosting environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `APP_HMAC_SECRET` (server-only, 32 cryptographically random bytes encoded as 64 hex characters)
- `NEXT_PUBLIC_SITE_URL` (canonical production origin)

Never put server-only keys in client code, `NEXT_PUBLIC_*`, Git, build logs or chat. Treat every customer transaction reference as unverified until an authorized admin confirms it.

## Current CI security status

Windows CI run #203 passed the application verification, full dependency audit and production dependency audit jobs. The production-readiness release also recorded a clean full and production-only audit on CI run #188. The full audit job fails on any future advisory, regardless of whether it is a development dependency.

The earlier GHSA-fc5q-39xc-vjpf / CVE-2026-112366 picomatch advisory was withdrawn by GitHub on 18 November 2026. See the [GitHub advisory record](https://github.com/advisories/GHSA-fc5q-39xc-vjpf).

Supabase Auth leaked-password protection remains disabled. This is a dashboard-level owner setting and must be enabled by the owner if the project's plan includes the feature. Supabase's HaveIBeenPwned-backed password protection is available on Pro and above.

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
