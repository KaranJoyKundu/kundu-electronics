# Kundu Electronics future implementation plan (reference-derived)

**Status:** Planning only. This file is not approval to implement. The local Kundu project was not available or inspected, so framework, directory structure and existing code dependencies remain unknown.

## Guiding principles

1. Borrow useful SparkFun patterns; do not copy SparkFun brand assets, text, proprietary styling or product images without permission.
2. Keep the Kundu catalogue and business facts grounded in the owner's data. Do not invent stock, prices, contact numbers, address, hours, payment numbers, warranty or delivery claims.
3. Preserve existing project architecture and working functionality. Inspect the repository and its agent instructions before planning file-level changes.
4. Make product discovery and checkout reliable on mobile, not just desktop.
5. Model availability and fulfillment as states, not a single stock boolean.

## Phase 0 — Repository intake and baseline (blocked until project access)

**Objective:** Learn the actual existing app before proposing code changes.

**Tasks:** Read all `AGENTS.md`, `CLAUDE.md`, skills, README and project documentation; identify framework, lockfile, scripts, routes, data, assets, tests and current functionality; run existing checks without modifying source; document the actual baseline.

**Dependencies:** Access to repository/ZIP and appropriate runtime.  
**Expected outputs:** Project-state audit, architecture diagram, existing route/component inventory, known-good test/build output.  
**Acceptance:** Every current route and important workflow is identified; no existing source file changed during audit.  
**Tests:** Existing test/typecheck/lint/build; smoke test current routes.  
**Risks:** Incomplete local context, uncommitted changes, environment-specific config.

## Phase 1 — Product and category information model

**Objective:** Define a canonical product model and a category taxonomy aligned to the real inventory.

**Tasks:** Inventory actual products, SKUs, categories, selling prices, cost-vs-selling-price separation, stock status, product attributes, variants, images and optional documentation. Define category-parent relationships and URL slugs. Define explicit unknown/placeholder fields.

**Dependencies:** Owner's product/inventory source and current project audit.  
**Expected files (provisional):** Product schema/types, category data, product repository/loader, data validation.  
**Acceptance:** Every sellable product has stable ID/SKU, title, selling price, category, real stock state and safe image fallback; no purchasing price is exposed publicly.  
**Tests:** Schema validation; unknown category/product; duplicate SKU; missing image; invalid/negative price; stock state coverage.  
**Risks:** Inventory document may mix cost and retail pricing; stale or inconsistent stock counts.

## Phase 2 — Shared shell and navigation

**Objective:** Provide a coherent store-wide shell inspired by the reference's layered navigation.

**Tasks:** Header/logo, top-level categories, nested menu, responsive mobile menu, search entry, account/cart access, footer, contact/support links. Decide a compact Kundu-specific category hierarchy rather than cloning SparkFun's 16-group catalog.

**Dependencies:** Actual category model and baseline architecture.  
**Expected files (provisional):** Layout, header, nav/menu, mobile nav, footer, tokens.  
**Acceptance:** Keyboard-accessible desktop nav and search; mobile navigation works by touch and keyboard; focus states and Escape/backdrop handling; no broken existing routes.  
**Tests:** Keyboard-only, screen-reader labels, 1440/1366/768/390 viewports, route link tests.  
**Risks:** Category tree too deep; inaccessible hover-only patterns; header consumes too much mobile height.

## Phase 3 — Search, category listing, filtering and sorting

**Objective:** Make products discoverable rapidly.

**Tasks:** Implement instant/type-as-you-search matching (typing `b` should surface Breadboard and other matches), category filters, price range min/max or usable presets (including ৳0–৳200), sorting, pagination/load-more if appropriate, empty/no-match state, clear filters and URL/state synchronization.

**Dependencies:** Validated product catalogue and category model.  
**Expected files (provisional):** Search component/index, category listing route, filter state/model, product card, list toolbar.  
**Acceptance:** Search updates while typing; `b` returns Breadboard and other matching products; range boundaries are inclusive and correct; combined filters and reset behave; counts/results match actual catalogue.  
**Tests:** Case-insensitive substring/token tests, Bengali/English search considerations, price boundary values, filter combinations, sorting stability, empty results, keyboard navigation and mobile filter drawer.  
**Risks:** Very small catalog does not need a complex backend; fuzzy matching could surface irrelevant items; currency formatting mismatch.

## Phase 4 — Product details

**Objective:** Present accurate product information and make purchase action clear.

**Tasks:** Product image(s), title, SKU, price, stock state, quantity control, add-to-cart, summary, specifications, real documentation links, available product options only when the data actually contains options, related products. Use distinct states for in-stock, low-stock if supported, out-of-stock, preorder/backorder only if business policy supports it and discontinued.

**Dependencies:** Phase 1 data model.  
**Expected files (provisional):** Product route, gallery, purchase panel, quantity control, specification/document links.  
**Acceptance:** Correct product is rendered from its stable URL; all price/status copy matches source; quantity cannot be invalid; missing data is omitted/clearly marked rather than fabricated.  
**Tests:** product states, image fallbacks, long titles/specs, duplicate SKU, quantity bounds, mobile layout.  
**Risks:** Product data may not contain multiple images or full specs; do not add fake galleries/content.

## Phase 5 — Cart and persistence

**Objective:** Implement a reliable cart for guest customers.

**Tasks:** Add/update/remove line items, quantity changes, subtotal calculation, total calculation policy, persistence across reloads, empty cart state, item availability changes and recovery after product edits.

**Dependencies:** Stable product IDs/prices and product availability rules.  
**Expected files (provisional):** Cart state/store, cart page/drawer, cart line item, totals utilities.  
**Acceptance:** Cart adds correct product/quantity; quantity/removal recomputes totals; cart survives refresh per chosen policy; no stale or negative quantities; stock/price changes handled transparently.  
**Tests:** Add/remove/update, duplicate add merges line item, persistence, storage corruption, price changes, out-of-stock transition, currency rounding.  
**Risks:** Browser storage privacy/expiry, concurrent tabs, price/stock race conditions.

## Phase 6 — Manual bKash/Nagad checkout

**Objective:** Collect orders with clear manual payment confirmation rather than pretending to provide an integrated payment gateway.

**Tasks:** Checkout contact/delivery details, selected delivery method if configured, payment-method selection, show the actual configured bKash/Nagad receiving number and exact instructions, transaction reference input, buyer name/phone, order summary, order confirmation. Provide admin-friendly order notification/storage only according to the approved backend/security design.

**Dependencies:** Owner-confirmed receiving numbers, payment account types, delivery/collection options, order handling process, backend/email/database decision.  
**Expected files (provisional):** Checkout route, payment instructions, order submission endpoint/service, validation, confirmation.  
**Acceptance:** No placeholder number can be mistaken for a live payment number; transaction reference is required for manual-transfer method; order is not marked paid solely because a reference was typed; personal data is handled securely.  
**Tests:** Valid/invalid phone/reference, missing payment details, order submission failure/retry, duplicate submit, payment pending state, amount mismatch, empty cart.  
**Risks:** Manual payment reconciliation, fraud/typos, personal data exposure, no order persistence backend.

## Phase 7 — Customer-facing support and trust content

**Objective:** Answer common buying questions and show only verified business policy.

**Tasks:** Contact page, FAQ, delivery/collection details, return/exchange policy, payment guide, business story, technical/help resources. Keep all unknown items as explicit placeholders until owner confirms them.

**Dependencies:** Confirmed business details and policies.  
**Expected files (provisional):** Content pages or CMS/data files.  
**Acceptance:** Every displayed policy and contact field is owner-verified; no SparkFun copy is reused; forms identify their destination and success state.  
**Tests:** Link checks, form validation, responsive content, content audit.  
**Risks:** Publishing incorrect return/shipping/payment promises.

## Phase 8 — Visual QA, accessibility, performance and security

**Objective:** Validate the full user journey on real devices and protect existing app quality.

**Tasks:** Compare to approved visual reference, test all breakpoints, keyboard navigation, semantic controls, image optimization, lazy loading, metadata, error/empty/loading states, security review and deployment preview.

**Dependencies:** Completed feature phases and repository baseline.  
**Expected files:** Test specs, QA notes, only the needed assets/config changes.  
**Acceptance:** All critical shopping flows pass; no regressions; mobile usability is acceptable; typecheck/lint/tests/build pass; no invented/secret data in client bundle.  
**Tests:** Automated unit/integration/e2e, accessibility scan/manual keyboard, performance audit, production build/preview.  
**Risks:** Existing architecture constraints, third-party service errors, mobile image/network performance.

## Phase 9 — Launch and maintenance

**Objective:** Release safely and keep catalogue information current.

**Tasks:** Backup/rollback, final content verification, deploy preview, owner approval, production deployment, analytics only with an appropriate consent/privacy design, catalogue update procedure and issue tracking.

**Dependencies:** Owner sign-off and production credentials/config.  
**Acceptance:** Tested release with rollback path and no placeholder business details.  
**Tests:** Production smoke test, checkout dry run without real payment, monitoring and backup restore check.  
**Risks:** Misconfigured payment instructions, stock mismatch, order notification failure.

## Approval gate

No phase above authorizes source-code changes now. Start Phase 0 only after the repository is made available, and implement only after the owner explicitly approves the research and implementation plan.
