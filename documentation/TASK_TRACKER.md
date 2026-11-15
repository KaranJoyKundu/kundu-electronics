# TASK_TRACKER — first public launch

**Last reviewed:** 15 November 2026  
Statuses: Not started · In progress · Blocked · Needs verification · Completed

## Release blockers

| ID | Priority | Task | Status | Acceptance criteria |
|---|---|---|---|---|
| KE-L01 | P0 | Sync the Windows clone to the reviewed feature branch | Needs verification | Working tree is backed up; branch and commit are confirmed; no owner changes are lost |
| KE-L02 | P0 | Run release checks on Node 24 | Needs verification | npm ci, typecheck, lint, test and build all pass on the same commit |
| KE-L03 | P0 | Refresh dependency audit | Needs verification | npm audit output is reviewed against the committed lockfile; no force upgrade or blind override |
| KE-L04 | P0 | Create and configure Supabase staging | Blocked | Project URL/keys set locally; migration applies cleanly; no production data used for testing |
| KE-L05 | P0 | Execute database security tests | Blocked | 23 pgTAP assertions pass; anonymous/customer/staff/admin and private Storage access are also checked |
| KE-L06 | P0 | Provision owner admin access | Blocked | Admin can sign in; anonymous/customer sessions cannot access protected admin pages/actions; public signup remains disabled |
| KE-L07 | P0 | Approve and publish first product batch | Blocked | Each product has confirmed public name, category, selling price, availability, description and approved image |
| KE-L08 | P0 | Configure delivery zones and charges | Blocked | Exact coverage and whole-BDT charges are owner-approved and tested in checkout |
| KE-L09 | P0 | Configure manual payment methods | Blocked | At least one payment method has an owner-approved receiving number and exact customer instructions |
| KE-L10 | P0 | Test complete order lifecycle | Blocked | Order creation, authoritative totals, idempotent retry, payment submission, pending state and staff verification pass in staging |
| KE-L11 | P0 | Deploy and verify Preview | Not started | Preview URL loads; auth callback, image URLs, API routes and server actions work |
| KE-L12 | P0 | Finish mobile and desktop QA | Not started | Critical flows pass at 390×844, 768×1024 and desktop viewport; no console/network errors |
| KE-L13 | P0 | Reconcile branch divergence and approve release | Blocked | Main-only commit is reviewed; production release PR is clean and explicitly approved |
| KE-L14 | P0 | Configure production hosting/domain | Not started | Correct production branch, environment variables, HTTPS and canonical site URL confirmed |
| KE-L15 | P0 | Run production smoke test | Not started | Public pages, catalogue, contact, cart and approved order/payment path behave as tested |

## Implemented foundation (do not rebuild)

- Responsive storefront routes and shared components.
- Search, category/price filtering, sorting and pagination.
- Product options, cart persistence and server-side cart product refresh.
- Supabase client boundaries, Auth Proxy and protected admin foundations.
- Product/category/image/inventory/order/payment/settings admin screens.
- Server-side checkout/order/payment routes with validation and idempotency.
- Initial database schema, RLS and private product-image policies.
- Unit tests covering core catalogue, cart, checkout and order parsing logic.

## Safe release fallback

If the database, payment or delivery release gates do not pass in time, publish only the catalogue/contact experience and leave checkout disabled. Do not pretend an order has been placed, show unverified stock, or ask customers to transfer money to an unconfirmed number.

## Post-launch improvements (not required for the first launch)

- Align .nvmrc with the Node 24 version used by CI and the owner’s Windows environment.
- Add automated browser tests and CI execution for database integration tests.
- Add a repeatable product import tool with a dry-run report and owner approval.
- Add monitoring, backup/restore drills and a routine dependency-update process.
- Split the initial SQL migration into forward-only migrations after the first validated deployment; never rewrite an already-applied migration.
