# PROJECT_STATE — Kundu Electronics

**Last updated:** 13 November 2026 (Asia/Dhaka)  
**Project phase:** Foundation created; Phase 1 data intake is in progress.  
**Active Git branch:** `feat/storefront-foundation`  
**Local Git status at handoff:** clean after committed foundation (see commit history).  
**GitHub remote:** not created; connector lacks repository-create action.

## Identity and objective

Build a production-capable, responsive electronics-components storefront for Kundu Electronics in Khulna, Bangladesh, using BDT (৳). SparkFun is the reference for useful storefront patterns and information architecture, not for copied brand assets, text or proprietary imagery.

## Source-of-truth documents

- `START_HERE.md` — onboarding and exact continuation task.
- `TASK_TRACKER.md` — status of implementation work.
- `IMPLEMENTATION_PLAN.md` — approved phase sequence.
- `DECISIONS.md` — technology, privacy and product-data decisions.
- `CHANGELOG.md` — repository changes.
- `TEST_REPORT.md` — actual checks and results.
- `ISSUES_AND_LIMITATIONS.md` — known blockers and missing information.
- `research/` — complete SparkFun research package copied unchanged from the verified ZIP.

## Repository recovery

A final connected-GitHub search did not find an existing Kundu Electronics repository accessible under the user's connected GitHub identity. No project ZIP/source upload was available in this session. The owner authorized creation of a replacement project. A local project and Git repository have been created. The GitHub integration does not expose a create-repository operation, so a private remote still requires owner creation or a connector permission/capability change.

Do not replace or discard this work if the original project later becomes accessible. Compare it first and merge useful prior work deliberately.

## Architecture established

- Next.js App Router with React and strict TypeScript.
- Tailwind CSS 4 is installed as the styling foundation in project configuration; custom CSS variables establish provisional Kundu tokens.
- Planned backend: Supabase Postgres and Auth. No Supabase project has been created and the migration has not been applied.
- Public-safe business settings are centralized in `src/config/business.ts`.
- Public catalogue data is centralized in `src/data/catalogue.ts`; it is empty until confirmed inventory and selling prices are supplied.
- Product public type excludes purchase cost / buying price.
- Search and combined category/price/sort utilities exist in `src/lib/catalog/search.ts` with test fixtures that do not appear in the live catalogue.
- No payment integration is connected. bKash/Nagad are disabled and their numbers are null.
- The initial home, shop empty state, cart empty state, about, support, contact, shipping/returns and product-not-found routes exist.

## Completed in this session

- Preserved all 11 research Markdown files under `documentation/research/`.
- Created root onboarding and project documentation.
- Initialized local Git `main` baseline and `feat/storefront-foundation` working branch.
- Created the Next.js/React/TypeScript/Tailwind app foundation.
- Created responsive shared header, search surface, footer, homepage, shop filters/empty state and supporting route shells.
- Created public-safe business settings and empty public product/category data.
- Added search/filter unit test fixtures, including the `b` → Breadboard requirement when a matching published item exists.
- Added a proposed Supabase core schema migration (not applied).

## Not completed / not yet verified

- Dependencies were not installed because npm registry access timed out in this environment.
- Six catalogue unit tests pass and the source syntax pass is clean. Full project typecheck is blocked by missing Next/React/Node type packages; lint and production build remain unrun until dependencies are installed.
- No browser-based screenshot or viewport inspection was available; responsive CSS is authored but not visually verified.
- No real inventory, product images, selling prices or confirmed policies were provided.
- No Supabase project, auth, database, admin dashboard, order creation API or payment verification workflow exists yet.
- No GitHub remote has been created or pushed.
- No production deployment has been configured.

## Immediate next steps

1. Install dependencies on a network-enabled environment (`npm install`), then run typecheck, lint, tests and production build; fix issues before further feature work.
2. Supply the inventory/selling-price source (preferred first business input); define a parser/import with strict cost-field exclusion.
3. Validate category taxonomy against real stock and publish only confirmed categories/products.
4. Create/connect a Supabase project; review and apply the migration only after schema/security review.
5. Complete product detail page, real catalogue search/filter and cart persistence.
6. Later add server-side checkout/order creation, pending manual-payment verification and protected admin flows.
7. Create private GitHub remote `kundu-electronics` and push local branches.

## Non-negotiable guardrails

No invented business data, no fake product listings/reviews/stock, no exposed buying prices, no payment numbers until configured, no client-exposed service-role key, and no treating a transaction reference as payment verification. Keep `main` stable and update this file at every meaningful milestone.
