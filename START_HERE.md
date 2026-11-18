# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components storefront
- Location/currency: Khulna, Bangladesh · BDT (৳)
- Design reference: https://www.sparkfun.com/
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private)
- Default branch: `main`
- Current launch work: `feat/launch-prep`
- Current review: draft PR #3 — https://github.com/KaranJoyKundu/kundu-electronics/pull/3
- Do not force-push, merge launch changes into `main`, or commit secrets.

## Read first

1. `documentation/LAUNCH_STATUS.md` — current verified hosting and launch state
2. `documentation/PROJECT_STATE.md`
3. `documentation/TASK_TRACKER.md`
4. `documentation/TEST_REPORT.md`
5. `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`
6. `documentation/DECISIONS.md`
7. `documentation/PRODUCT_DATA_IMPORT.md`
8. `documentation/research/README.md`

## Stack and local commands

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript and Tailwind CSS 4.3.3.
- Node.js 24 and npm 11 are used in Windows CI.

Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and `npm audit`.

## Current catalogue and photos

- Supabase contains **211 published product rows across 17 categories**, matching the complete 211-SKU inventory.
- The shop supports search, category and BDT price filtering with exact-count pagination.
- The photo gallery contains all 211 products, each matched to its supplied/licensed photograph by SKU P001–P211. The owner confirmed usage rights for the full image set; the 19 Creative Commons source images are credited at `/image-credits`.
- The optimized photo sprite is committed at `public/product-previews/kundu-catalogue-sprite.webp` (46 KB) and is used by both the shop and product/gallery views.
- 49 products are honestly labelled “Price on request”; six products have unrecorded stock (“Availability to confirm”). Workbook availability currently shows 129 in stock, 34 low stock and 42 out of stock. Confirm selling prices and availability physically before sales are enabled.

## Hosting and production

- Production site is live: https://kundu-electronics.vercel.app
- Vercel reports the latest production deployment READY from `feat/launch-prep` commit `900d331f396027becca4e95fcdd8b91683a55087`.
- Separate preview: https://kundu-electronics-58i018i2w-kundu2409056-5098.vercel.app
- `main` remains unchanged; the current production deployment was built from the launch feature branch.
- The storefront is enquiry-only. Checkout is disabled by live Supabase settings; no payment methods or delivery zones are enabled. The cart sends WhatsApp enquiries only.
- Vercel holds sensitive `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` entries; their values are not written into this repository or documentation.
- Stable TypeScript-ESLint `8.73.0` is committed. Windows application verification and candidate checks passed; 14 high development-tooling findings remain. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

## Privacy and publication rules

- Public business settings are centralized in `src/config/business.ts`.
- Public product records expose customer-facing selling prices only. Never add purchase prices, supplier identity, margins or internal notes.
- Never commit the raw business brief, master workbook, supplier documents, credentials or `.env.local`.
- Do not publish photos with unverified reuse rights.
- No product is purchasable while checkout is disabled.
- bKash/Nagad, delivery areas/charges and checkout remain disabled until owner-approved receiving details, instructions, delivery rules and server secrets are configured and verified.
- Checkout requires `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` as server-only hosting environment variables.
- A submitted transaction reference is not payment verification.
- Public admin registration is disabled. One owner admin profile is now linked to an email-confirmed Supabase Auth user; successful sign-in still needs a test.
- Never expose Supabase secret/service-role keys in `NEXT_PUBLIC_*`, browser code, Git or chat.
