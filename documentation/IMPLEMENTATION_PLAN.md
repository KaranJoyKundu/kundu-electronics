# IMPLEMENTATION_PLAN — approved Kundu Electronics build

**Approval:** Owner approved implementation on 13 November 2026.  
**Approach:** Incremental delivery; keep `main` stable; work on feature branches.  
**Reference:** SparkFun public research is preserved under `research/`.

## Phase 0 — Project intake and foundation (substantially complete; checks pending)

- Create replacement project after connected-GitHub and current-upload recovery attempt.
- Establish Next.js App Router, React, TypeScript, Tailwind CSS, scripts and strict configuration.
- Preserve the SparkFun research package and project continuity docs.
- Centralize business config and establish a public product data model.
- Create local Git repository, baseline branch and feature branch.
- Acceptance: all documents exist; app routes authored; no invented business facts; dependency-backed checks pass.

## Phase 1 — Product and business data model (started)

- Receive inventory / selling-price document.
- Map public product fields: stable ID, SKU, name, slug, description, BDT selling price, category, availability, real specs, real image(s), publication status.
- Explicitly exclude supplier cost / buying price and private stock notes from public types and export.
- Reconcile categories against actual stock; maintain hierarchical category slugs.
- Validate duplicate SKU, invalid price, missing title/category, missing images, and unpublished status.
- Acceptance: a verified catalogue import can populate `src/data/catalogue.ts` or the backend without leaking private data.

## Phase 2 — Global design and navigation

- Refine announcement/utility area, wordmark, responsive header, mega-menu/nested mobile navigation, search placement, breadcrumbs and footer.
- Use real Kundu logo when supplied; current text mark is a provisional placeholder.
- Revisit exact SparkFun dimensions only after real screenshots/browser access; current design tokens are Kundu provisional values, not measured SparkFun tokens.
- Acceptance: no dead links, keyboard support, accessible mobile nav, screenshot QA at 1440×900, 1366×768, 768×1024 and 390×844.

## Phase 3 — Homepage

- Match reference section rhythm: hero, curated categories, featured product sections, useful resource/support content and footer.
- Display products/category tiles only when their underlying data is confirmed.
- Acceptance: no fabricated counts, stock, reviews, promotions or business claims.

## Phase 4 — Category listings

- Category landing pages, breadcrumbs, subcategory shortcuts, result toolbar, filters, sorting and pagination/load more as appropriate.
- Facets depend on real category attributes; do not clone all SparkFun facets.
- Acceptance: correct counts, combined filters and clear-all; all states mobile usable.

## Phase 5 — Product search

- Live partial matching across product name, SKU, brand and summary.
- `b` returns Breadboard when it exists and is published in the actual catalogue.
- Empty query/no results, keyboard-accessible suggestions, mobile search and URL query state.
- Acceptance: search tests with real verified product fixtures and browser QA.

## Phase 6 — Price/category filter and sort

- Inclusive min/max BDT controls, useful preset such as ৳0–৳200, category filters, multi-filter combination, sorting, clear-all, counts.
- Acceptance: correct results at boundaries; no NaN/negative input; usable mobile filter drawer.

## Phase 7 — Product details

- Correct title/SKU, image gallery, BDT price, status, quantity, add to cart, real specs, datasheets and related products when relationships exist.
- Support statuses: in stock, low stock only if quantity supports it, out of stock, backorder only if policy permits, discontinued, build-to-order only when configured.
- Acceptance: no fabricated specs; distinct template states for product variations.

## Phase 8 — Cart

- Add/remove/change quantity, duplicate item merge, persistence, availability/price revalidation, subtotal and total policy.
- Cart can use client persistence for non-sensitive product IDs/quantities; server recomputes price at order submission.
- Acceptance: reload and price-change cases tested; no customer/payment data in localStorage.

## Phase 9 — Supabase backend and manual checkout

- Create Supabase project, apply reviewed migration, configure RLS and Auth for authorized staff.
- Server-side order creation, server-side price/stock recomputation, order/item snapshots, customer/delivery fields.
- bKash/Nagad manual instructions only after receiving number is confirmed; store transaction reference, sender phone only if needed, method, amount, pending state.
- Order payment state remains `pending_verification` until admin confirmation; reference submission never auto-marks paid.
- Acceptance: server validation, access-control tests, order persistence, error handling, manual verification and no exposed secret key.

## Phase 10 — Supporting pages

- About, contact, shipping/returns, FAQ, support and account pages using only supplied business information.
- Acceptance: every visible link resolves; policies are confirmed; no empty or misleading pages.

## Phase 11 — QA and release

- Typecheck, lint, unit/integration/E2E, security review, accessibility, browser matrix, performance and production build.
- Deploy a preview before production; configure environment variables outside Git; test checkout without real payment.
- Acceptance: documented tests pass, screenshots show no major layout issues, no placeholders on production, rollback path available.

## Dependencies and approval requests

Implementation is already approved. No new general approval is required. Essential external inputs are the actual selling-price/inventory source, Supabase project/credentials for backend phase, and confirmed payment/business details before those features are activated.
