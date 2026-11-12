# TASK_TRACKER

Status: Not started · In progress · Blocked · Completed · Needs verification

| ID | Priority | Task | Status | Evidence / next acceptance criteria |
|---|---|---|---|---|
| KE-001 | P0 | Recover correct repository and preserve feature branch | Completed | Correct connected identity `KaranJoyKundu`; private `KaranJoyKundu/kundu-electronics`; remote `main` and feature heads verified. |
| KE-002 | P0 | Preserve original SparkFun research package | Completed | All 11 Markdown research documents preserved under `documentation/research/`. |
| KE-003 | P0 | Preserve local feature worktree | Completed | Work continues from `f3ae4bc`; 35 modified/untracked status entries preserved; no reset/clean. |
| KE-004 | P0 | Migrate ESLint to Next 16 flat config | Needs verification | `eslint.config.mjs` uses `eslint-config-next/core-web-vitals` and `/typescript`; run on installed dependencies. |
| KE-005 | P0 | Pin Turbopack root and configure Next scroll behavior | Needs verification | `next.config.ts` derives root from its own file path; root layout has `data-scroll-behavior`; rerun Windows/dev output. |
| KE-006 | P0 | Resolve seven moderate npm audit findings | Blocked | Need exact `package-lock.json` and `npm audit --json`; no blind `--force`. |
| KE-007 | P0 | Restore lockfile and dependency verification | Blocked | Need owner's generated lockfile; then `npm ci`, audit and CI. |
| KE-008 | P1 | Parse owner business brief into safe candidate import | Completed | 74 candidate records outside Git; 66 single integer-price candidates; 8 flagged ambiguous/estimated; zero published. |
| KE-009 | P1 | Obtain original inventory and source price files | Blocked | Need `pricing_and_inventory.md`, `component_pricing_analysis.md`, robot price source files and relevant PDFs. |
| KE-010 | P1 | Review/approve product catalogue rows | Blocked | Owner confirms candidate prices, SKU, variant, availability, specs and images. |
| KE-011 | P1 | Build product/category/variant data schema | In progress | Migration includes normalized products, categories, variants and safe public views; SQL execution pending. |
| KE-012 | P1 | Build secure Supabase clients and auth/admin authorization | In progress | Server/browser/public/admin clients, Next 16 proxy and admin roles exist; live Supabase integration pending. |
| KE-013 | P1 | Build admin product/category/variant/image maintenance | In progress | Routes/actions authored; needs auth/database integration tests and browser QA. |
| KE-014 | P1 | Build stock tracking and audited adjustments | In progress | tracked/untracked/unknown modes, movement log, reservations and adjustment RPCs; needs DB concurrency tests. |
| KE-015 | P1 | Build authoritative/idempotent checkout | In progress | Service-role RPC derives prices, delivery charge, locks rows, snapshots and reserves stock; needs live database verification. |
| KE-016 | P1 | Build manual payment submission and staff verification | In progress | bKash/Nagad config starts disabled; payment stays pending; admin verification audit exists; needs DB/RLS tests and owner config. |
| KE-017 | P1 | Complete live catalogue search/listing/cart integration | In progress | DB RPC search, 24-row pagination, cart-ID lookup and variant price resolver; needs Supabase fixtures/browser tests. |
| KE-018 | P1 | Complete public checkout UI and order lifecycle | Needs verification | API/schema foundations exist; payment/delivery config unconfigured; end-to-end flow not yet browser tested. |
| KE-019 | P1 | Run 23 pgTAP security-contract assertions | Blocked | Requires Supabase CLI/Postgres/Docker; all 23 assertions are present in test file. |
| KE-020 | P1 | Add fixture-based RLS/role/concurrency integration tests | Not started | Prove anonymous/customer/staff/admin isolation, no price tampering, no oversell, idempotency. |
| KE-021 | P1 | Add Playwright responsive and checkout tests | Blocked | Install dependencies and browser tooling; test 1440×900, 1366×768, 768×1024, 390×844. |
| KE-022 | P2 | Configure CI and Dependabot | Blocked | Add after lockfile is committed; CI should run install, typecheck, lint, test, build, then database integration where supported. |
| KE-023 | P2 | Prepare safe preview deployment | Not started | Requires Supabase environment, approved products, checkout/security verification. |
| KE-024 | P2 | Commit and push current worktree | Needs verification | Local commit `c38f358` created and worktree clean; GitHub push blocked by local DNS. Import update bundle, fetch actual GitHub remote, then push normally if no divergence. |

## Current session handoff

13 November 2026: backend foundation expanded (catalogue DB search/pagination, variants, admin image/variant management, order/payment APIs, inventory/order RPCs, private storage and RLS draft). Latest tests: 23 passed; git diff check passed. Full app checks and SQL tests not run in assistant runtime. See `PROJECT_STATE.md` and `TEST_REPORT.md`.
