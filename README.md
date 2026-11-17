# Kundu Electronics

Responsive electronics-components storefront for Kundu Electronics, Khulna, Bangladesh. Currency: BDT (৳).

## Current implementation

- Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
- Homepage, searchable and filterable shop, product details, curated photo gallery, cart, contact, support, shipping-policy placeholder and image credits.
- Live Supabase project provisioned in ap-northeast-1. The initial schema and public catalogue count migrations are applied.
- Live database currently has **158 published product rows across 17 categories**.
- Shop search, category and BDT price filters use server-side catalogue queries. Pagination uses an exact filtered count; all seven page numbers are available for the current catalogue.
- **33 products have real photographs:** 16 shop-supplied photos plus 17 open-licensed source photos. Sources and licence details are recorded at `/image-credits`. Other products use component-specific illustrations labelled as illustrations, not photographs.
- Supabase has 21 public tables with RLS enabled and two private storage buckets. Generated database types are in `src/lib/supabase/database.types.ts`.
- Protected admin routes cover products, categories, image uploads, variants, inventory, orders, payment verification and store settings. Public admin registration is disabled; an owner-provisioned Supabase user and role are required.

## Not ready to accept orders

- Checkout is disabled in Supabase.
- bKash and Nagad receiving details/instructions are not configured or enabled.
- No delivery zones or delivery charges are configured.
- The cart remains usable as a saved cart, but the customer checkout form stays unavailable. The API and database reject order creation while prerequisites are missing.
- One admin profile now exists with the `admin` role and is linked to an email-confirmed Supabase Auth user. A successful sign-in and protected-page session have not yet been verified.
- Product prices and stock labels require final owner review before sales are accepted.

## Hosting and deployment

The production site is now live at **https://kundu-electronics.vercel.app**. Vercel reports the deployment as READY from `feat/launch-prep` commit `e8735cf5950a27bb1bd512397dbb16b79c5fa808`; the canonical domain alias points to that deployment. `main` remains unchanged.

A separate preview is available at `https://kundu-electronics-58i018i2w-kundu2409056-5098.vercel.app`. The production site is enquiry-only: checkout remains disabled because no payment method or delivery zone is enabled in Supabase.

The Vercel project has the public Supabase URL/key and sensitive server-only entries. The values for `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` are not included in this repository or this documentation.

Required hosting environment variables for local/other environments:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `APP_HMAC_SECRET` (server-only, 32 cryptographically random bytes encoded as 64 hex characters)
- `NEXT_PUBLIC_SITE_URL` (the final canonical origin)

Never put server-only keys in client code, `NEXT_PUBLIC_*`, Git, build logs or chat. Do not enable checkout until payment and delivery configuration is approved and checkout is tested end-to-end.

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
