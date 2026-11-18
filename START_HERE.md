# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components storefront
- Location/currency: Khulna, Bangladesh · BDT (৳)
- Design reference: https://www.sparkfun.com/
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private)
- Default branch: `main`
- Latest storefront release: PR #4 merged into `feat/launch-prep` at commit `e8fe75e445b84f802a470d4ef373d3d33e232a89`.
- Production branch: feat/launch-prep; review and merge the follow-up there, not into main.
- PR #4: https://github.com/KaranJoyKundu/kundu-electronics/pull/4 — merged into `feat/launch-prep`. Separate draft PR #3 to `main` remains open and unmerged.
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

- Supabase currently has **208 published products across 18 categories**: 199 remaining original catalogue products (including P091) plus nine project bundles. The other 12 resistor-named listings are archived.
- The shop supports search, category and BDT price filtering with exact-count pagination.
- The photo sprite retains all 211 original SKU photo tiles P001–P211. The active catalogue now shows 199 original products and nine robot-kit bundles; project bundles use labelled artwork. The owner confirmed usage rights for the full image set; the 19 Creative Commons source images are credited at `/image-credits`.
- The optimized photo sprite is committed at `public/product-previews/kundu-catalogue-sprite.webp` (46 KB) and is used by both the shop and product/gallery views.
- The original product-image archive covers 211 catalogue SKUs. The robot-kit Markdown labels its tier totals as estimated costs; the shop confirms final kit scope and amount before payment. Twelve other resistor-named product records are archived; P091 remains published at ৳1. 49 original products are still “Price on request”; six have unrecorded stock. Confirm details before guaranteeing availability.

## Hosting and production

- Production site is live: https://kundu-electronics.vercel.app
- Vercel reports the latest production deployment READY from `feat/launch-prep` merge commit `e8fe75e445b84f802a470d4ef373d3d33e232a89`.
- Preview used for release verification: https://kundu-electronics-elepd16xd-kundu2409056-5098.vercel.app (READY before production promotion).
- `main` remains unchanged; the current production deployment was built from the launch feature branch.
- Website order requests are enabled with server-calculated totals and stock confirmation. Payment is not collected online; bKash/Nagad remain disabled until verified receiving numbers and instructions are supplied. Delivery: Standard (12 hours–1 day, ৳0) or Urgent (30–60 minutes, ৳50). WhatsApp messages include product code, name, unit price × quantity, line total, delivery and final total; direct calling is supported.
- Vercel holds sensitive `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` entries; their values are not written into this repository or documentation.
- Stable TypeScript-ESLint `8.73.0` is committed. Windows application verification and candidate checks passed; 14 high development-tooling findings remain. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

## Privacy and publication rules

- Public business settings are centralized in `src/config/business.ts`.
- Public product records expose customer-facing selling prices only. Never add purchase prices, supplier identity, margins or internal notes.
- Never commit the raw business brief, master workbook, supplier documents, credentials or `.env.local`.
- Do not publish photos with unverified reuse rights.
- Nine build-to-order bundles (LFR, Soccer Bot and RC Speed Battle, three tiers each) can be added to cart. Bundle orders require shop stock confirmation.
- bKash/Nagad transfers remain disabled until exact business receiving numbers and customer instructions are supplied. Website order requests can still be recorded without payment; payment status remains not_submitted until arranged and verified by the shop.
- Checkout requires `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` as server-only hosting environment variables.
- A submitted transaction reference is not payment verification.
- Public admin registration is disabled. One owner admin profile is now linked to an email-confirmed Supabase Auth user; successful sign-in still needs a test.
- Never expose Supabase secret/service-role keys in `NEXT_PUBLIC_*`, browser code, Git or chat.
