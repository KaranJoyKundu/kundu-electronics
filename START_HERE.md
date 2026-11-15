# START HERE — Kundu Electronics

**Documentation reviewed:** 15 November 2026  
**Repository:** KaranJoyKundu/kundu-electronics (private)  
**Application branch:** feat/storefront-foundation  
**Documentation work:** docs/launch-readiness-48h

## Project goal

Launch a trustworthy electronics-components storefront for Kundu Electronics in Khulna, Bangladesh. Prices are customer-facing selling prices in BDT (৳). SparkFun is an information-architecture reference, not a source of business facts.

## Read in this order

1. README.md — project overview and local setup.
2. documentation/PROJECT_STATE.md — what exists and what is still unverified.
3. documentation/LAUNCH_PLAN_48_HOURS.md — the short launch sequence and release gates.
4. documentation/TASK_TRACKER.md — actionable work and status.
5. documentation/ISSUES_AND_LIMITATIONS.md — blockers and risks.
6. documentation/TEST_REPORT.md — what has and has not actually passed.
7. documentation/PRODUCT_DATA_IMPORT.md — rules for preparing public product records.
8. documentation/DECISIONS.md and documentation/research/README.md — decisions and design research.

## Git guardrails

- The repository is private and the correct GitHub owner is KaranJoyKundu.
- Continue application work on feat/storefront-foundation.
- Keep main stable. As of this review, feat/storefront-foundation is 18 commits ahead of main and 1 commit behind it. Reconcile the main-only commit and review the resulting PR before merging.
- Never force-push, reset away owner work or deploy an unreviewed branch.
- The documentation refresh is isolated in docs/launch-readiness-48h and should be reviewed through a pull request targeting feat/storefront-foundation.

## Stack and local commands

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 and Supabase.
- Use Node 24 to match GitHub Actions and the owner’s documented Windows environment. package.json accepts Node >=22.6; .nvmrc currently says 22, so standardize this later rather than changing Node versions mid-release.
- The feature branch contains package-lock.json. Use npm ci, not npm install, for the release verification.

~~~powershell
npm ci
Copy-Item .env.example .env.local
npm run dev

npm run typecheck
npm run lint
npm test
npm run build
npm audit
~~~

Fill .env.local only with the correct project values. Do not commit it.

## Configuration that must be ready for a transactional launch

- Supabase project URL and publishable key.
- Server-only Supabase secret key and a newly generated APP_HMAC_SECRET.
- Database migration applied and tested.
- Admin user created in Supabase Auth and assigned the store admin role through an owner-controlled procedure.
- Approved products/categories, customer-facing selling prices, actual availability and product images.
- At least one owner-approved delivery zone and exact delivery charge.
- At least one owner-approved manual payment method, receiving number and customer instructions.
- Checkout enabled only after staging and production smoke tests pass.

## Business-data rules

Public business settings are centralized in src/config/business.ts. Verify the phone, address, email and Facebook destination before production. Opening hours, delivery charges, delivery timeline, warranty and return rules are not confirmed in the current source; do not make them up.

Candidate products are not automatically publishable. Public product data may contain the selling price only. Never commit raw inventory/pricing workbooks, purchasing costs, supplier details, margins, credentials or customer records.

## Exact next action

Follow documentation/LAUNCH_PLAN_48_HOURS.md from the top. First, update the Windows clone to the intended feature-branch commit without overwriting local changes; then run npm ci and the five verification commands. Do not start production checkout configuration until the staging database migration and role/security checks pass.
