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

- Supabase contains 158 published product rows across 17 categories.
- The shop supports search, category and BDT price filtering with exact-count pagination.
- The curated photo gallery contains 33 products with actual photographs: 16 shop-supplied images and 17 open-licensed images. See `/image-credits` for attribution and licence details.
- Products without an approved photograph receive component-specific illustrations explicitly labelled as illustrations.
- Product prices and availability labels need final owner review before sales are enabled.

## Hosting and preview

- Existing Vercel project: `kundu-electronics`.
- Verified domain alias: https://kundu-electronics.vercel.app (the current production-target deployment is from an earlier commit and was not changed here).
- Latest feature preview (READY): https://kundu-electronics-9m5a2bgty-kundu2409056-5098.vercel.app
- The feature preview is separate from the production alias and has not been promoted.
- Vercel has public Supabase URL/key configured. `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` are blank; checkout must remain disabled.
- The current Windows CI application checks passed, but npm audit reports 9 high and 6 moderate development-tooling findings. See `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.

## Privacy and publication rules

- Public business settings are centralized in `src/config/business.ts`.
- Public product records expose customer-facing selling prices only. Never add purchase prices, supplier identity, margins or internal notes.
- Never commit the raw business brief, master workbook, supplier documents, credentials or `.env.local`.
- Do not publish photos with unverified reuse rights.
- No product is purchasable while checkout is disabled.
- bKash/Nagad, delivery areas/charges and checkout remain disabled until owner-approved receiving details, instructions, delivery rules and server secrets are configured and verified.
- Checkout requires `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET` as server-only hosting environment variables.
- A submitted transaction reference is not payment verification.
- Public admin registration is disabled. Owner provisioning and role assignment must be performed through Supabase Auth and the protected database.
- Never expose Supabase secret/service-role keys in `NEXT_PUBLIC_*`, browser code, Git or chat.
