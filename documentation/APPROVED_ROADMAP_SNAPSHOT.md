> Historical planning snapshot prepared before the owner authorized replacement-project creation and implementation. Current status and approved actions are superseded by `PROJECT_STATE.md`, `TASK_TRACKER.md` and `IMPLEMENTATION_PLAN.md`. This snapshot is preserved for continuity.

# Kundu Electronics — Implementation Roadmap and Session Baseline

**Prepared:** 13 November 2026 (Asia/Dhaka)
**Reference:** https://www.sparkfun.com/
**Scope:** Implementation planning and recovery only. No Kundu application source has been changed.

## 1. Current session result

The user supplied MASTER PROMPT 2, authorizing the website implementation workflow and requiring project recovery before code changes. The SparkFun research archive was found at `/mnt/data/sparkfun_reference_research.zip` and passed `unzip -t` integrity validation. The eleven Markdown files in the archive were present and readable.

The research package contains:

- 77 page/URL records.
- 41 direct page-text retrievals or redirect resolutions.
- 30 search-result-only records.
- 6 records explicitly labeled inaccessible (the Learn tutorials index also returned useful search text but direct retrieval returned 403).
- 48 named interaction scenarios, none executed in a real browser.
- 0 real webpage screenshots.
- 0 fully inspected responsive pages.

The package is strong as an information-architecture, page-pattern and feature checklist. It is not a pixel-accurate design specification: no CSS inspection, computed style extraction, live browser session, viewport emulation or interactive testing was available during research.

## 2. Repository and project recovery status

### Available in this session

- The user's MASTER PROMPT 2 text attachment.
- The SparkFun reference research folder and ZIP archive.

### Not available in this session

- The Kundu Electronics application repository/worktree.
- `AGENTS.md`, `CLAUDE.md`, the project README or website-reconstruction skill instructions from that repository.
- The project's package manifest/lockfile, source files, assets, environment configuration, tests or deployment configuration.
- A `.git` directory or current branch/working-tree state for the target project.

The publicly discoverable repositories returned for the user's GitHub account did not include a Kundu Electronics project. A similarly named repository owned by a different GitHub account was not treated as the user's project.

### Consequence

The required baseline cannot yet be established. It is not safe to select a framework, create a branch, run project scripts, alter dependencies, or write application code without seeing the real project. No source files have been created, modified or deleted; no packages have been installed; no tests/build/typecheck/lint commands have been run against the application.

## 3. Research-derived implementation principles

1. Preserve the existing framework, routing, build system and working behavior wherever possible; determine them during Phase 0 before selecting an architecture.
2. Use SparkFun as a pattern reference, not as a source of Kundu product data, copy, imagery or policy text.
3. Build a coherent Kundu catalogue based on real inventory. Do not replicate SparkFun's full taxonomy unless the actual product range warrants it.
4. Category listing facets should reflect available product attributes; the research indicates SparkFun's category filters vary by category.
5. Support distinct product availability states only where Kundu's inventory and fulfilment policy can accurately support them.
6. Search must be type-as-you-search; a query such as `b` should include Breadboard where that product exists in the real catalogue.
7. Category and price filters must combine correctly. Required example range: ৳0–৳200.
8. Cart operations must use stable product IDs, validate quantities, recompute totals correctly and persist guest-cart state without trusting client-supplied prices at order submission.
9. Manual bKash/Nagad payment is not an integrated gateway. A submitted transaction reference must leave the order pending manual verification; it must never mark an order paid automatically.
10. Unknown business facts, phone numbers, payment numbers, stock, prices, specifications, delivery terms and policies must remain explicit placeholders or be omitted until verified.
11. Customer personal data and order records require a trusted backend/storage decision. A frontend-only mock is not production checkout.
12. Do not claim visual fidelity or test success without actual screenshots and executed tests.

## 4. Recommended phased roadmap

### Phase 0 — Repository recovery and baseline (BLOCKED)

**Objective:** Understand the real project and establish a safe starting point.

**Tasks:**
- Obtain access to the existing repository/worktree.
- Read `AGENTS.md`, `CLAUDE.md`, cloning skill instructions, README and all project documentation; start with `documentation/PROJECT_STATE.md` if present.
- Inspect complete source tree, routes, components, assets, data sources, package scripts, dependencies, hosting and environment configuration.
- Inspect Git branch and working-tree status; preserve every existing user change.
- Map current implemented features and known issues.
- Run existing typecheck, lint, tests and build only after understanding the scripts and environment.
- Record a baseline before any source change.

**Expected outputs:** Verified architecture map, current-route inventory, feature-preservation checklist, baseline test report, branch/worktree record.

**Acceptance:** Project identity and current state are confirmed; uncommitted changes are preserved; existing commands/results are recorded; no application source is modified during audit.

**Stop condition:** If repository access is incomplete, do not invent the architecture or begin replacing files.

### Phase 1 — Catalogue and business-data model

**Objective:** Establish a trustworthy product/category source of truth before designing shopping interactions.

**Tasks:**
- Identify the current inventory/price data source(s) and how maintainers update them.
- Determine which field is the customer-facing selling price; prevent internal purchasing/cost fields from reaching public responses or client bundles.
- Define product ID/SKU, slug, title, short/long description, BDT price, stock state, category, images, optional specifications, and optional variants based only on available data.
- Define category parent/child structure from actual sellable inventory.
- Define data validation and safe fallbacks for missing images/descriptions/specifications.

**Dependencies:** Phase 0; access to current product/inventory source.

**Acceptance:** Every published item has a stable identifier, correct selling price, truthful availability and category; private/internal fields are never public; missing facts are not fabricated.

**Tests:** Duplicate IDs/SKUs, missing/invalid price, negative price, missing image, unknown category, stock-state mapping, malformed source data.

### Phase 2 — Architecture and global design foundation

**Objective:** Fit the new store into the existing app rather than replacing it unnecessarily.

**Tasks:**
- Choose routing/state/data patterns only after Phase 0 architecture inspection.
- Define design tokens and typography based on verified reference observations plus Kundu brand constraints.
- Establish responsive page container, spacing and grid primitives.
- Organize only necessary assets; document licenses/source/ownership.
- Define an accessible global shell and theme behavior consistent with the existing app.

**Dependencies:** Phase 0 and Phase 1.

**Acceptance:** Existing routes continue working; new global styles do not regress existing pages; theme behavior is consistent; no unverified SparkFun dimensions are represented as facts.

### Phase 3 — Global shell and navigation

**Objective:** Make the store understandable and navigable on desktop and mobile.

**Tasks:**
- Announcement/utility area if relevant to Kundu.
- Header, logo, primary navigation, category hierarchy, nested menus, mobile navigation, search entry, cart indicator and footer.
- Keyboard focus, Escape behavior, accessible labels and touch-friendly controls.
- Avoid hover-only access to essential navigation.

**Dependencies:** Phases 1–2.

**Acceptance:** All menu links are real; keyboard and touch interactions work; navigation adapts to mobile without overflow; existing routes are preserved.

**Tests:** Keyboard-only operation, menu open/close, focus management, mobile touch, broken-link checks at target viewports.

### Phase 4 — Homepage and merchandising

**Objective:** Create a useful landing page using actual Kundu products and business data.

**Tasks:**
- Hero/intro, featured products, real categories, useful promotions and technical/help content as supported by verified assets/data.
- Add product cards and reusable category tiles.
- Use a clear no-data state rather than fake reviews, stock messages or promotional claims.

**Dependencies:** Phases 1–3.

**Acceptance:** Every product/promotion links to a real route; all content is supported by verified Kundu data; visual hierarchy works on all required viewports.

### Phase 5 — Catalogue, category listings and filters

**Objective:** Enable customers to browse a real catalogue efficiently.

**Tasks:**
- Category and subcategory routes, breadcrumb trail, product grid and product cards.
- Category-specific attributes/facets where the data supports them.
- Price minimum/maximum or useful presets including ৳0–৳200.
- Combined filters, product counts, clear-all and sorting.
- Pagination or load-more only if justified by actual catalogue size and current app patterns.
- Mobile filter drawer/accordion as appropriate.

**Dependencies:** Phases 1–4.

**Acceptance:** Filters compose correctly; boundaries are correct; empty states are useful; count matches displayed products; URLs/state behave consistently.

**Tests:** Filter combinations, price boundary values, sorting, empty results, clear filters, mobile controls, query-state reload.

### Phase 6 — Instant search

**Objective:** Make product discovery work while typing.

**Tasks:**
- Search product titles and other confirmed useful fields (e.g. SKU/category) using the actual catalogue.
- Partial, case-insensitive matching; keyboard selection; clear/empty/no-result states.
- Mobile search experience.
- If a server search is required, debounce and handle loading/failure states.

**Dependencies:** Phase 1 and product-card/route foundation from Phases 3–5.

**Acceptance:** Query `b` surfaces Breadboard when available and other relevant matches; no-results and clear states work; selected result opens the correct product.

**Tests:** Exact/partial/case variants, short query, empty query, no match, SKU, keyboard navigation, mobile.

### Phase 7 — Product details and product-state variants

**Objective:** Display accurate information and safe purchase controls.

**Tasks:**
- Product gallery only to the extent that real image data supports it.
- SKU/title/price/availability, quantity selector, add-to-cart, descriptions/specifications and related products.
- Explicit product-state handling (in stock, out of stock, discontinued, preorder/backorder) only where Kundu policy/data supports each state.
- Add real product options only where source data defines them.

**Dependencies:** Phases 1 and 5.

**Acceptance:** Product route is canonical; no invented specs; quantity bounds are enforced; CTA matches stock/fulfilment state; missing data is handled honestly.

**Tests:** Long titles, absent images/specs, stock changes, quantity bounds, variants if present, mobile purchase panel.

### Phase 8 — Cart and persistence

**Objective:** Deliver correct guest-cart behavior.

**Tasks:**
- Add product, merge duplicate line items, update quantities, remove lines, empty state, cart indicator and totals.
- Persist minimal cart identifiers/quantities for guests; hydrate product names/prices/stock from the trusted catalogue.
- Handle stale/removed products and price/stock changes transparently.

**Dependencies:** Phase 7.

**Acceptance:** Quantities and totals are correct; invalid quantities are blocked; reload restores cart; user cannot manipulate the authoritative order price through client storage.

**Tests:** Add/remove/update, duplicate add, storage corruption, reload, stale product, out-of-stock transition, totals and currency rounding.

### Phase 9 — Checkout, backend and manual payments

**Objective:** Collect an order safely and explain manual payment accurately.

**Tasks:**
- Decide backend/order persistence only after inspecting current hosting and architecture.
- Collect customer and delivery details that are genuinely required.
- Select bKash or Nagad; display only owner-configured receiving number and exact owner-approved instructions.
- Display order amount and collect sender number/reference as required.
- Validate input and prevent duplicate submission.
- Create order with a `pending_payment_verification`/equivalent state; provide a confirmation reference.
- Provide a secure admin workflow/notification for manual reconciliation if the approved backend supports it.

**Dependencies:** Phases 1 and 8; owner-confirmed payment numbers, account type, delivery/collection policy, order-handling process and backend decision.

**Acceptance:** No fake payment number or gateway; transaction reference submission is not proof of payment; order is not marked paid until manual verification; customer data is stored/transmitted securely.

**Tests:** Missing/invalid fields, payment method switch, missing config, duplicate order, network failure/retry, pending state, empty cart, amount integrity, access control.

### Phase 10 — Support, trust and account pages

**Objective:** Complete important customer-facing routes without inventing policy.

**Tasks:** About, contact, FAQ, shipping/delivery, return/exchange, support/payment guide, and account flows only where needed and supported by a backend/auth strategy.

**Dependencies:** Verified business details/policies; backend decision for submissions/authentication.

**Acceptance:** No dead links or invented address/phone/hours/returns; forms have a real destination and visible success/failure behavior.

### Phase 11 — Verification, security and release

**Objective:** Validate the integrated store and ship safely.

**Tasks:**
- Browser automation and manual tests at 1440×900, 1366×768, 768×1024 and 390×844.
- Compare screenshots against SparkFun and approved Kundu design decisions; avoid false claims of pixel accuracy because current research screenshots do not exist.
- Accessibility, keyboard, responsive overflow, broken links, SEO, performance and security checks.
- Re-run all baseline tests and identify regressions.
- Deploy preview, smoke test, owner review and rollback plan.

**Dependencies:** All feature phases.

**Acceptance:** Critical shopping flows pass; no known high-impact security issues; no unsupported business facts; tests/build/lint/typecheck pass where present; limitations documented; owner approves production release.

## 5. Provisional technical design constraints (not final architecture decisions)

- Retain the app's current framework and conventions unless the Phase 0 audit demonstrates a compelling reason to change them.
- Keep catalogue data behind a small repository/adapter layer so the source can change without rewriting UI components.
- Represent money in an integer smallest unit or a decimal-safe representation; do not calculate with binary floating-point currency values.
- Use stable product IDs in cart state; re-read authoritative price and stock at checkout.
- Keep payment receiving numbers and order configuration out of source literals where practical; missing configuration must visibly disable/flag that payment method rather than show fake values.
- Never store sensitive customer data in browser local storage. Persist only what is needed for guest cart continuity.
- Do not add account authentication unless the project/business requirements and secure backend support justify it; guest checkout can be simpler.
- Use a backend or trusted server action for order creation, price/stock validation and personal-data handling. A frontend-only form cannot be represented as a reliable production order system.
- Add dependencies only after inspecting the current package and explaining their necessity.

## 6. Project-level progress documents to maintain after repository access

Inside the target repository, maintain and update:

- `documentation/PROJECT_STATE.md` — canonical live state and exact next action.
- `documentation/TASK_TRACKER.md` — task IDs, status, dependencies and acceptance criteria.
- `documentation/IMPLEMENTATION_PLAN.md` — phases and decisions as scope changes.
- `documentation/DECISIONS.md` — concise ADR-style decisions and alternatives.
- `documentation/CHANGELOG.md` — actual files and behavior changed in each session.
- `documentation/TEST_REPORT.md` — commands actually run and their results.
- `documentation/ISSUES_AND_LIMITATIONS.md` — unresolved bugs, missing business facts and risks.
- Preserve the existing SparkFun research documents and reference their source snapshot date.

Do not create these in an unrelated repository or overwrite existing project documents until the actual repository structure has been reviewed.

## 7. Immediate next action

**Unblock Phase 0 by making the existing Kundu Electronics repository/worktree accessible in this session.** A private GitHub repository must be explicitly identified and available through the connected GitHub integration, or the existing project must be supplied as a ZIP. Once available, inspect instructions, current code, Git status and baseline checks before changing anything. No source-code implementation should precede that audit.
