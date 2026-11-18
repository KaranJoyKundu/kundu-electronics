# TASK_TRACKER

Statuses: Not started · In progress · Blocked · Completed · Needs verification

| ID | Priority | Task | Status | Evidence / acceptance criteria |
|---|---|---|---|---|
| KE-001 | P0 | Recover correct GitHub repository and preserve feature branch | Completed | Connected identity `KaranJoyKundu`; private `KaranJoyKundu/kundu-electronics`; remote refs verified. |
| KE-002 | P0 | Preserve SparkFun research package | Completed | All 11 research Markdown files remain under `documentation/research/`. |
| KE-003 | P0 | Continue from pushed backend foundation without discarding history | Completed | Local worktree starts at remote feature commit `de253ee`; `main` remains at `d883393`; no reset or force push. |
| KE-004 | P0 | Repair ESLint flat config and React hook/accessibility failures | Needs verification | Flat config was already migrated; cart provider/page, order confirmation and SearchBox refactored. Run ESLint with the owner's lockfile/dependencies to verify zero errors/warnings. |
| KE-005 | P0 | Fix generated Next.js dev route type collision | Needs verification | `tsconfig` excludes `.next/dev`, includes production `.next/types`; script runs `next typegen`. Verify on Windows with existing `.next/dev` directory present. |
| KE-006 | P0 | Resolve seven moderate npm audit alerts safely | Blocked | Supplied audit JSON analysed. Need actual `package-lock.json` and `npm audit fix --dry-run --json`; no forced upgrade or override applied. |
| KE-007 | P0 | Restore/commit dependency lockfile | Blocked | Owner's Windows `package-lock.json` is not included in this worktree. Required for reproducible installs and exact audit. |
| KE-008 | P1 | Convert owner business brief into safe import proposal | Completed | Candidate product records are outside Git; all remain draft/unapproved. |
| KE-009 | P1 | Obtain original inventory and pricing source files | Blocked | Need source inventory, component pricing analysis and robot pricing documents; never ingest private purchase costs into public model. |
| KE-010 | P1 | Review/approve product catalogue entries | Blocked | Owner must approve selling price, SKU, actual stock status, specs and images before publish. |
| KE-011 | P1 | Build normalized product/category/variant schema | In progress | Migration authored; execute and test on disposable Supabase before production. |
| KE-012 | P1 | Build Supabase Auth and admin authorization | In progress | Server/browser/public/admin clients and protected routes exist; live project integration and RLS tests pending. |
| KE-013 | P1 | Build admin product/category/variant/image maintenance | In progress | Admin routes/actions exist; validate on real Supabase and browser. |
| KE-014 | P1 | Build stock tracking and audited adjustments | In progress | Unknown/tracked/untracked quantities and movement history modeled; concurrency tests pending. |
| KE-015 | P1 | Build atomic, server-authoritative checkout | In progress | SQL derives price/charges, locks stock rows and creates snapshots; DB integration tests pending. |
| KE-016 | P1 | Build manual payment submission and staff verification | In progress | bKash/Nagad disabled pending configuration; submissions remain pending until human verification; integration tests pending. |
| KE-017 | P1 | Complete search/listing/cart API boundaries | Needs verification | Typed RPC parser, query parser, runtime response parsers, pagination and single-character search implemented; unit tests pass; full Next typecheck pending. |
| KE-018 | P1 | Verify cart hydration and persistence | Needs verification | `useSyncExternalStore` implementation and storage tests added; browser hydration/multi-tab tests still needed. |
| KE-019 | P1 | Run Supabase pgTAP security contract | Blocked | Requires Supabase CLI/Postgres; do not mark complete until the migration is applied to a disposable DB and all assertions pass. |
| KE-020 | P1 | Add RLS/roles/concurrency integration tests | Not started | Verify anon/customer/staff/admin separation, price-tampering resistance, idempotency and oversell prevention. |
| KE-021 | P1 | Run responsive Playwright and checkout browser tests | Blocked | Requires installed dependencies, browser and configured staging backend; test 1440×900, 1366×768, 768×1024 and 390×844. |
| KE-022 | P2 | Add CI and Dependabot | Blocked | Add after lockfile is committed; CI should use `npm ci` and run typecheck/lint/test/build. |
| KE-023 | P2 | Prepare preview deployment | Not started | Requires database, owner configuration, approved products and security/browser sign-off. |
| KE-024 | P0 | Commit first verification remediation on feature branch | Completed | Previous commit `5949f4c` is pushed to `feat/storefront-foundation`; no merge to `main`. |
| KE-025 | P0 | Fix remaining payment-method, order-effect, cart memo and test fixture issues | Needs verification | Source fixes and new parser tests are present; full Windows typecheck/lint still require owner dependency installation. |
| KE-026 | P0 | Separate Next 16 typegen and strict typecheck inputs | Needs verification | Base config includes both generated paths; `tsconfig.typecheck.json` excludes `.next/dev`; build uses TypeScript API checker. Verify on Windows with existing dev output. |
| KE-027 | P0 | Inspect actual Windows lockfile and refresh npm audit | Blocked | No package-lock is available in the uploaded artifacts, current GitHub tree or assistant worktree. Do not change dependencies until supplied. |
| KE-028 | P0 | Commit remaining Windows verification source fixes | Completed locally; push pending | Commit is created on `feat/storefront-foundation` after the 42-test suite, strict parser check, syntax scan and diff check; full Next/ESLint/audit commands remain blocked in this runtime. |

## Latest verification remediation task details

- Payment config parser accepts only supported `bkash`/`nagad` values and drops malformed entries; two tests added.
- Order confirmation loading is request-keyed and derived from state. Async completion handlers update state only after the network request; AbortController plus sequence guards prevent stale results. Order response parser tests added.
- Cart page no longer memoizes a Map against a newly-created conditional products array; storage fixture is immutable `const`.
- Base Next 16 config includes both generated route directories; standalone typecheck config excludes `.next/dev`. Build uses the TypeScript API checker to filter stale dev validators. Full Windows verification remains pending.

## Current session handoff

13 November 2026 follow-up after remote base `5949f4c`: payment method narrowing, order confirmation request-state refactor, cart product-map memo warning, and the const test fixture are fixed in source. Added payment configuration/order summary parser tests; `npm test` reports 42 passed. The strict parser TypeScript check passes and 78 TS/TSX files have zero syntax diagnostics. `git diff --check` passes. Full typecheck/lint/build are blocked here because Next/ESLint dependencies are not installed; `npm audit` is blocked by the absent Windows lockfile. The current audit document in Library is dated 12 November and is not a fresh report for this branch state. Import the follow-up bundle and run all five commands on the Windows clone. See `documentation/TEST_REPORT.md`.


## 18 November 2026 follow-up task records

| ID | Priority | Task | Status | Evidence / acceptance criteria |
|---|---|---|---|---|
| KE-031 | P1 | Keep only P091 as a published resistor item | Completed | P091 remains published at its existing ৳1 price; the other 12 resistor-named records are archived and marked discontinued, not deleted. |
| KE-032 | P1 | Publish three-tier robot bundles | Completed | Nine database-backed bundles added with the exact source-sheet prices and BOMs: LFR-T1–T3, SB-T1–T3 and RC-T1–T3. |
| KE-033 | P1 | Add founder story and projects showcase | Completed | About the Founder page, 3-second five-project homepage carousel and /projects showcase added. |
| KE-034 | P1 | Complete website, WhatsApp and phone order paths | Completed in source | Website order procedure records unpaid requests; WhatsApp message contains code/name/unit price × qty/line total/delivery/final total; phone link is available. |
| KE-035 | P1 | Configure delivery modes | Completed | Standard 12h–1 day / ৳0 and Urgent 30–60 minutes / ৳50 are live and used by server checkout calculations. |
| KE-036 | P1 | Upload Kundu Brothers brand logo and update documentation | In progress | Logo asset and docs added on follow-up branch; verify CI and Vercel preview. |
| KE-037 | P1 | Verify production-ready order flow, UI and deployment | Needs verification | Run Windows typecheck/lint/tests/build, preview browser checks, production deployment, and a test order before declaring the launch verified. |


## 18 November 2026 storefront follow-up — current branch

| ID | Priority | Task | Status | Evidence / acceptance criteria |
|---|---|---|---|---|
| KE-031 | P1 | Keep only P091 as a published resistor item | Completed | P091 remains published at its existing ৳1 price; the other 12 resistor-named records are archived and marked discontinued, not deleted. |
| KE-032 | P1 | Publish three-tier robot bundles | Completed | Nine database-backed bundles use the estimates and BOMs from the uploaded Markdown: LFR-T1–T3, SB-T1–T3, RC-T1–T3. Component P-codes were verified against the live catalogue; unavailable items are identified in the BOM. |
| KE-033 | P1 | Add founder story and projects showcase | Completed | About the Founder page, 3-second five-project homepage carousel and /projects showcase added. |
| KE-034 | P1 | Complete website, WhatsApp and phone order paths | Completed | Website order requests use server-side price/delivery calculation. WhatsApp message has code/name/unit price × quantity/line total/delivery/Total; phone link available. No payment is collected online. |
| KE-035 | P1 | Configure delivery modes | Completed | Standard 12h–1 day / ৳0 and Urgent 30–60 minutes / ৳50 are live; urgent is an explicit button. |
| KE-036 | P1 | Upload Kundu Brothers brand logo and update documentation | Completed | Logo added to header, footer and browser icons; README, start guide, launch report, project state and kit/checkout docs updated. |
| KE-037 | P1 | Verify CI and Vercel preview | Completed | Windows CI passed typecheck, lint, tests and production build; Vercel preview deployment READY. Current follow-up PR #4 targets feat/launch-prep and remains unmerged. |
| KE-038 | P1 | Label robot-kit prices as estimates | Completed | Source Markdown states “Total estimated cost”; product pages, order confirmation and WhatsApp handoff now say estimates and defer final amount confirmation until before payment. |

