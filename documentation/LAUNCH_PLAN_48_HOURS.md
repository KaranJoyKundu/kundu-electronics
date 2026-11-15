# 48-hour launch plan — Kundu Electronics

**Prepared:** 15 November 2026 (Asia/Dhaka)  
**Target:** a controlled public launch by 17 November 2026  
**Application baseline:** feat/storefront-foundation

This is a release plan, not a promise that every integration is already working. The code has a storefront, cart, admin foundation and manual-order backend, but the live database, product catalogue, delivery configuration and payment settings are still unverified.

## Decide what “live” means

There are two acceptable release levels:

### A. Transactional store

Customers can browse approved products, add items to cart, place orders, submit a bKash/Nagad transaction reference and see order/payment status. Staff can review and verify the payment.

This requires every P0 release gate in this document to pass. Do not enable checkout merely because the admin toggle exists.

### B. Catalogue/contact soft launch

Customers can browse verified products and contact the shop, but checkout stays disabled. This is the safe fallback if the database, payment or delivery checks are not complete by the deadline. The cart can remain visible, but the site must clearly say that online checkout is not available yet.

Do not accept orders or ask customers to transfer money unless the transactional release gates pass.

## Day 1 — establish a verified release candidate

### 1. Freeze scope and protect the current work

- Work from feat/storefront-foundation, not the older main branch.
- Back up the local Windows working tree and check git status before pulling or switching branches.
- Review the latest feature-branch changes. At the 15 November repository check, the feature branch was 18 commits ahead of main and 1 commit behind it. Inspect the main-only commit and reconcile branch history through a reviewed PR; do not force-push.
- Do not spend this deadline redesigning the site or adding new features. Fix only release-blocking defects.

### 2. Install and run the application checks

Use Node 24 to match the GitHub Actions workflow and the owner’s documented Windows environment.

~~~powershell
node --version
npm --version
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
~~~

Acceptance:
- All five project checks complete on the same commit.
- No TypeScript or lint errors are waived.
- Any npm audit findings are reviewed against the committed package-lock.json. Inspect npm audit fix --dry-run first; do not use npm audit fix --force.
- Save the output as the release evidence.

### 3. Create a disposable Supabase staging project

Do not test the first migration directly against production.

- Create a Supabase project for staging and record its project URL and publishable key.
- This repository currently does not include supabase/config.toml. To use the local Supabase CLI workflow, install the Supabase CLI, run supabase init from the repository root, review the generated config.toml and commit it. The init command creates local project configuration; it does not itself connect to or modify a hosted project.
- Start the local Supabase stack with Docker available, review supabase/migrations/0001_initial_schema.sql, and apply the migration to a disposable local/staging database. Never point local test/reset commands at production.
- Run supabase/tests/security_contract.test.sql with the Supabase CLI/pgTAP workflow (for example, supabase test db after the local database is running). It contains 23 assertions.
- Also verify real anonymous, customer, staff and admin sessions. Confirm that customers cannot read other customers’ orders, inventory history, payment submissions or audit data.
- Upload a draft product image and a published product image. Verify that public access works only for published product paths and staff can preview drafts.
- Fix any SQL, RLS, Storage or Auth failure before proceeding.

### 4. Provision one owner administrator

- Create the owner account through Supabase Auth; do not enable public self-registration.
- Assign the admin role using an owner-controlled procedure in the Supabase SQL Editor.
- Sign in at /admin/login.
- Verify an anonymous session is redirected and a non-admin account cannot access owner-only settings/payment verification.

Do not expose the Supabase secret key in a browser variable or in Git.

### 5. Prepare the first product batch

Do not try to publish the entire candidate catalogue under time pressure.

- Select 10–20 products that customers are most likely to need immediately.
- Confirm each product’s exact customer-facing name, category, selling price in BDT, actual availability, description/specifications and correct product photo.
- Confirm that the image belongs to the exact product/model and is permitted for use.
- Add them through the admin product workflow. Keep each product in draft until its details are checked, then publish.
- Set orderable only when the stock/availability process is understood. Unknown stock must stay unknown; do not mark it in stock to make the catalogue look full.
- Never import or publish buying prices, supplier names, margins or private stock notes.

Day 1 exit gate: app checks are green, staging migration and security tests pass, owner admin can sign in, and the first product batch is ready for review.

## Day 2 — configure, test and release

### 6. Prepare production Supabase

After staging passes:

- Create or select the intended production Supabase project.
- Apply the same reviewed migration to the empty production database.
- Configure Auth redirect/callback URLs for the actual site origin.
- Create the owner admin and verify access.
- Keep a record of the exact migration version and project.

Do not copy staging customer/test records into production.

### 7. Configure store operations

Use the admin Store settings screen after the production database and admin account work.

- Add at least one delivery zone with an exact coverage description and owner-approved whole-BDT charge.
- Configure bKash and/or Nagad with the exact owner-approved receiving number and customer instructions.
- Make sure the enabled payment method matches the account that will actually receive and reconcile transfers.
- Confirm the manual payment review process and who is authorized to verify/reject transactions.
- Replace the shipping/returns placeholder with the shop’s actual approved delivery, returns and after-sales policy.
- Verify the public phone, address, email and Facebook link in src/config/business.ts. Opening hours are currently unset; do not invent them.

Keep the checkout switch OFF until the next step passes.

### 8. Test the complete transactional flow in staging

Use test products and controlled test orders. Do not use fake payment confirmation or mark a payment verified without actually checking the transaction.

- Search for a single character and a full product name.
- Combine category and price filters; test sorting and pagination.
- Open a product, select an option, add it to cart, change quantity and remove it.
- Submit a valid order and confirm the displayed totals match the database-derived order.
- Retry the same submission and confirm it does not create a duplicate order.
- Confirm invalid, unpublished, discontinued or unavailable products cannot be ordered.
- Open the order confirmation in the same browser and refresh the order status.
- Submit a payment reference in staging and confirm it is shown as pending verification.
- Sign in as the authorized administrator and verify/reject the payment. Confirm the customer cannot perform that action.
- Confirm payment status and fulfilment status are independent.
- Test the disabled state again: with missing payment/delivery prerequisites, checkout must remain unavailable.

If this flow fails, leave checkout disabled and use the catalogue/contact soft launch.

### 9. Deploy a Preview, then production

Recommended hosting: Vercel for the Next.js application, with Supabase as the database/Auth/Storage provider.

- Connect the private GitHub repository to Vercel.
- Deploy a Preview from the reviewed feat/storefront-foundation branch first. Do not deploy main blindly while the branches are diverged.
- Set environment variables in Vercel, separately for Preview and Production:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  - SUPABASE_SECRET_KEY
  - APP_HMAC_SECRET
  - NEXT_PUBLIC_SITE_URL
- SUPABASE_SECRET_KEY and APP_HMAC_SECRET are server-only. Never prefix them with NEXT_PUBLIC_.
- Test the Preview using the production-like staging project. Verify the Auth callback, product images, search, cart, order APIs and admin routes.
- Choose and document the production branch. Prefer reconciling the feature branch with main and merging through a reviewed PR. If the release must use the feature branch temporarily, make that production-branch change deliberately and plan the later main reconciliation; do not silently ship stale main.
- Connect the custom domain and verify HTTPS. A provider subdomain is acceptable for the first soft launch while DNS is being completed.
- Set NEXT_PUBLIC_SITE_URL to the exact canonical production origin and redeploy.

### 10. Final release checklist

- [ ] Production homepage, shop, product pages and contact page load over HTTPS.
- [ ] Business contact details and social links are correct.
- [ ] Published products have owner-approved price, availability and images.
- [ ] Search and filters work on mobile and desktop.
- [ ] Cart add/update/remove works.
- [ ] Shipping/returns text reflects actual approved policy.
- [ ] No secrets or private buying-cost data appear in page source, browser requests or Git.
- [ ] Admin login and role restrictions work.
- [ ] If transactional launch: order creation, duplicate protection, payment submission and admin verification all pass.
- [ ] If any transactional gate is incomplete: checkout remains disabled and the soft-launch wording is clear.
- [ ] A real production smoke test is completed after the final deployment.

Test at minimum:
- Mobile: 390×844
- Tablet: 768×1024
- Desktop: 1366×768 or 1440×900

## What to postpone until after launch

Do not let these items delay a safe first release:

- Bulk catalogue import until the source data and image-to-product mapping have been reconciled.
- Product-specific/variant-specific inventory if the business does not yet track stock that way.
- Automated bKash/Nagad gateway integration; the current implementation is manual verification only.
- Advanced analytics, promotions, reviews, wishlist and non-essential visual redesign.
- Splitting the initial SQL migration after it has been validated; use forward migrations for future schema changes.

## Official deployment references

- Next.js deployment options: https://nextjs.org/docs/app/getting-started/deploying
- Vercel Next.js framework guide: https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel Preview/Production environments: https://vercel.com/docs/deployments/environments
- Supabase Next.js SSR and environment setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- Supabase deployment workflow: https://supabase.com/docs/guides/deployment
