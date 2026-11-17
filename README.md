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
- No admin profile exists yet. The owner must create an Auth user in Supabase, then assign the approved role using the server-only admin key.
- Product prices and stock labels require final owner review before sales are accepted.

## Hosting and deployment

The Vercel project `kundu-electronics` already exists and has a verified domain alias at `https://kundu-electronics.vercel.app`. Its current production-target deployment is an older commit and was not changed here.

A separate READY preview was built from `feat/launch-prep` commit `3aa7a646fd50933bff1ebe95b509d6f0d338d93f`:
`https://kundu-electronics-9m5a2bgty-kundu2409056-5098.vercel.app`

The preview is not promoted to the production domain. The Vercel project has the public Supabase URL and publishable key configured. Its server-only `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` values are blank, so checkout remains disabled.

Required hosting environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `APP_HMAC_SECRET` (server-only, 32 cryptographically random bytes encoded as 64 hex characters)
- `NEXT_PUBLIC_SITE_URL` (the final canonical origin)

Never put server-only keys in client code, `NEXT_PUBLIC_*`, Git, build logs or chat. Do not enable checkout until secrets are configured in the hosting provider and checkout is tested end-to-end on the production origin.

## Current CI security status

The latest Windows run passed typecheck, lint, tests and production build, but `npm audit` reports 15 development-tooling findings (9 high, 6 moderate, 0 critical). No lockfile remediation was committed. The full evidence and safe-remediation decision are in `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

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
