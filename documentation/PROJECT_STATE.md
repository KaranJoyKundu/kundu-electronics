# PROJECT_STATE — Kundu Electronics

**Last reviewed:** 15 November 2026 (Asia/Dhaka)  
**Repository:** KaranJoyKundu/kundu-electronics (private)  
**Application branch:** feat/storefront-foundation  
**Documentation branch:** docs/launch-readiness-48h

## Objective

Deliver a reliable electronics-components storefront for Kundu Electronics in Khulna, Bangladesh, using customer-facing selling prices in BDT. The first release should prioritize a correct catalogue, product search, cart, clear contact routes and safe manual ordering. Advanced commerce is not considered live until its database, payment and delivery paths pass real-environment tests.

## Architecture

- Next.js 16 App Router and route handlers, React 19, strict TypeScript and Tailwind CSS 4.
- Modular monolith: Next.js application plus Supabase PostgreSQL, Auth and Storage.
- Separate browser, public-server, cookie-backed server and privileged server Supabase clients.
- Next.js 16 src/proxy.ts refreshes Supabase Auth cookies.
- Public product records expose selling price only; private purchase costs, supplier details and margins are excluded.
- Catalogue search and listing use database RPCs, server-side pagination and validated query/response boundaries.
- Checkout recomputes price, delivery and stock server-side; client cart totals are display-only.
- Product images are stored in a private Supabase Storage bucket and served through signed URLs.

## Implemented application surface

- Responsive home, shop, product details, cart, about, contact, support and shipping/returns routes.
- Search, category and price filters, sorting, one-character search and bounded listing pagination.
- Product variants/options and price overrides. Inventory is intentionally tracked at parent-product level.
- Browser cart persistence and cart-product refresh from the server.
- Admin route foundations for catalogue, category, variant, image, inventory, order, payment-verification and settings management.
- Checkout API, guest order access, manual payment submission and order-status UI.
- Database migration and a 23-assertion pgTAP security-contract file.

Implementation does not equal production verification. No production integration should be claimed until tested against the intended Supabase project.

## Current release status

| Workstream | Status | Evidence / remaining proof |
|---|---|---|
| Storefront UI and routes | Implemented; browser QA pending | Source exists; test at desktop/tablet/mobile sizes |
| Search, filters and cart | Implemented; browser QA pending | Unit tests exist; test real Supabase catalogue and browser persistence |
| Unit tests | 42 passed in the last documented assistant-runtime run | Rerun on the current Windows clone |
| Typecheck, lint and build | Needs current verification | Run on Node 24 after npm ci |
| Dependency audit | Needs fresh verification | package-lock.json is committed on the feature branch; run npm audit on it |
| Supabase project | Not connected/verified | Create staging and production projects or a deliberate equivalent |
| Database migration | Written, not applied to a verified project | Apply to disposable/staging project and inspect errors |
| RLS, Storage and pgTAP | Not verified against a live database | Run pgTAP and role-based checks |
| Admin authentication/roles | Code exists; integration pending | Provision one owner admin; test anonymous/customer/staff/admin access |
| Product catalogue | Empty public catalogue | Approve and publish a first small batch of products |
| Delivery and payment | Unconfigured; payment methods disabled | Owner must supply exact delivery zones/charges and payment details/instructions |
| Checkout/order flow | Implemented behind configuration gates | Test order creation, idempotency, status, manual payment submission and staff verification |
| Hosting/domain | Not verified in this repository review | Create Preview deployment, confirm production branch, domain and HTTPS |

## Git state and release safety

As of the 15 November 2026 repository review, feat/storefront-foundation was 18 commits ahead of main and 1 commit behind it. The branches have diverged. Keep main unchanged while verifying the feature branch; reconcile the main-only commit and use a reviewed PR before merging. The current documentation update is isolated in docs/launch-readiness-48h and is intended to merge into feat/storefront-foundation, not main.

## Business data state

- src/config/business.ts contains the current public contact configuration. The owner must confirm that the displayed details and social destination are correct before launch.
- Opening hours are null.
- Candidate catalogue material is not a published catalogue. The import notes identify 74 component/kit candidates, including 8 price cases needing clarification; no candidate should be assumed approved.
- No stock quantity, technical specification, image licence, delivery fee, warranty or return policy should be invented.
- Public product models must never contain purchase price, supplier or margin data.

## Security and operational rules

- Keep SUPABASE_SECRET_KEY and APP_HMAC_SECRET server-only.
- Do not enable public registration or let users self-assign admin/staff roles.
- Verify RLS for anonymous, customer, staff and admin roles.
- Do not accept orders until the migration, stock rules, delivery settings and manual payment configuration are validated.
- Customer-entered bKash/Nagad transaction references remain pending until authorized staff verify the actual transfer.
- Do not log customer addresses or full payment references.

## Immediate next steps

1. On Windows, update the working clone safely to feat/storefront-foundation and run npm ci.
2. Run typecheck, lint, unit tests, production build and a fresh npm audit; fix failures without weakening type safety or forcing incompatible package upgrades.
3. Create a disposable/staging Supabase environment, apply the migration and run pgTAP plus role/Storage checks.
4. Provision one owner admin, add a first owner-approved product batch and test image uploads.
5. Configure exact delivery/payment settings, test the order and manual payment lifecycle, and only then enable checkout.
6. Deploy a Preview, complete responsive/browser QA, reconcile branch divergence and release through an approved production branch.

See documentation/LAUNCH_PLAN_48_HOURS.md for the time-boxed release checklist.
