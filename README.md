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

The production site is live at **https://kundu-electronics.vercel.app**. The latest Vercel production deployment is READY at `https://kundu-electronics.vercel.app` from `feat/launch-prep` merge commit `e8fe75e445b84f802a470d4ef373d3d33e232a89` (deployment `dpl_FBM9DvHwx7u1KJ981EcqrsDSSKXa`). `main` remains unchanged.

PR #4 was merged into `feat/launch-prep` on 18 November 2026. The ready preview before promotion was `https://kundu-electronics-elepd16xd-kundu2409056-5098.vercel.app`. Draft PR #3 to `main` remains open and unmerged. Website order requests are available without online payment; bKash/Nagad remain disabled pending verified receiving details.

The Vercel project has the public Supabase URL/key and sensitive server-only entries. The values for `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` are not included in this repository or this documentation.

Required hosting environment variables for local/other environments:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `APP_HMAC_SECRET` (server-only, 32 cryptographically random bytes encoded as 64 hex characters)
- `NEXT_PUBLIC_SITE_URL` (the final canonical origin)

Never put server-only keys in client code, `NEXT_PUBLIC_*`, Git, build logs or chat. Keep online payment disabled until verified bKash/Nagad receiving details and instructions are supplied. Website order creation remains separate from payment verification.

## Current CI security status

The latest Windows candidate passed clean installation, typecheck, lint, tests and production build. Stable TypeScript-ESLint `8.73.0` and `minimatch@11.0.9` are committed on `feat/launch-prep`. The previous six moderate findings are cleared; 14 high findings remain in development-only lint tooling, including the unresolved `picomatch <=4.0.7` advisory. The normal audit lane remains red until that upstream issue is fixed. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

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
