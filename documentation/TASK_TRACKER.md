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
| KE-024 | P0 | Commit verification remediation on feature branch | Completed | Source and documentation fixes are committed on `feat/storefront-foundation`; use `git log -1` for the current remediation commit. No merge to `main`. |

## Verification remediation task details

- TypeScript API errors: source-level fix uses explicit runtime parsing from `unknown`; full project typecheck remains unverified here.
- Generated Next route type errors: likely stale `.next/dev/types` inclusion under isolated dev build; generated files were not edited. `next typegen` plus exclude has been configured; verify on Windows.
- React effects: state now derives from keyed async results or external cart store; no lint suppression added.
- Accessibility: input role explicitly set to combobox with listbox popup semantics.
- npm audit: root advisory is `minimatch` GHSA-g3hv-75wg-m249 / CVE-2026-118764; all seven flags are indirect roll-ups. Exact resolved versions and compatible fix require the lockfile.

## Current session handoff

13 November 2026: source-level TypeScript and React hook/accessibility fixes, typed API boundary parsers, cart store hydration/persistence, and regression tests are committed on `feat/storefront-foundation`. `npm test`: 38 passed, 0 failed. Targeted strict TypeScript and the 74-file transpile-only syntax scan passed. Full Next typecheck/lint/build are blocked in this runtime because dependencies are absent; `npm audit` is blocked by the missing lockfile. Import the update bundle and run the four full checks on the Windows clone. See `documentation/TYPECHECK_LINT_AUDIT_REMEDIATION.md` and `documentation/TEST_REPORT.md`.
