# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics
- Purpose: Electronics components e-commerce store
- Business location: Khulna, Bangladesh
- Currency: BDT (৳)
- Reference: https://www.sparkfun.com/
- Suggested GitHub repository: `kundu-electronics` (private)

## Read these files first

1. `documentation/PROJECT_STATE.md` — current factual project state.
2. `documentation/TASK_TRACKER.md` — active, blocked and upcoming tasks.
3. `documentation/DECISIONS.md` — approved technology and data/security decisions.
4. `documentation/IMPLEMENTATION_PLAN.md` — incremental delivery phases.
5. `documentation/TEST_REPORT.md` — checks actually executed and their outcomes.
6. `documentation/ISSUES_AND_LIMITATIONS.md` — blockers, missing data and unverified work.
7. `documentation/research/README.md` — entry point to the complete SparkFun reference package.

## Current branch and status

The active implementation branch is `feat/storefront-foundation`. The local repository's `main` branch is kept as the initial project/documentation baseline. No GitHub remote exists yet.

## Start the app

```bash
npm install
cp .env.example .env.local
npm run dev
```

Node.js 20.9+ is required; Node 22 LTS is recommended. Do not expect the app to connect to a database until a Supabase project is created and environment variables are supplied.

## GitHub setup required

The connected GitHub integration currently exposes repository read/write tools but no repository-creation action. Create a **private** repository named `kundu-electronics` under the correct owner account, leave it empty (do not initialize a README, license or .gitignore), then run:

```bash
git remote add origin https://github.com/OWNER/kundu-electronics.git
git push -u origin main
git push -u origin feat/storefront-foundation
```

Replace `OWNER` with the GitHub account/organization. Alternatively, connect a GitHub integration/token with repository-administration permission and an explicit repository-create capability.

## Important safety rules

- Do not invent phone, email, street address, hours, delivery charges, policy terms, reviews, product prices, product availability or payment numbers.
- Do not publish any product until its selling price and customer-facing fields are verified.
- Never expose supplier buying prices, purchase costs, private inventory notes or Supabase secret/service-role keys to the browser.
- A submitted bKash/Nagad transaction reference means `pending_verification`, not paid.
- Preserve `documentation/research/` and its evidence-status labels. Its text/IA findings are useful, but visual screenshots and interaction tests were not performed.
- Prefer feature branches and meaningful commits; keep `main` stable.

## Exact continuation task

Continue Phase 1: obtain the owner's approved inventory/selling-price source, define a safe import mapping that cannot leak buying price, validate product/category records, and add only confirmed public catalogue entries. Then implement product details and catalogue search/filter UI against that data. Do not wait for business contact/payment details to proceed with independent UI work.
