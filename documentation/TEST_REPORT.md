# TEST_REPORT

**Last updated:** 13 November 2026 (Asia/Dhaka)

## Current assistant-runtime checks (commit `c38f358`)

| Command/check | Result | Notes |
|---|---|---|
| `npm test` | PASS — 23 passed, 0 failed | Catalogue search/filter (6), cart variant pricing (5), checkout/idempotency/validation (10), image signatures (2). |
| `git diff --check` | PASS | No whitespace errors. |
| TypeScript/TSX transpile-only scan | PASS — 65 files, 0 syntax diagnostics | Syntax-only; not a substitute for `tsc --noEmit`. |
| `npm run typecheck` | BLOCKED | `node_modules` absent in assistant worktree; required Next/React/Supabase/Node type packages unavailable. |
| `npm run lint` | BLOCKED | ESLint package unavailable in assistant worktree. Config migrated to official Next 16 flat config but not executed here. |
| `npm run build` | BLOCKED | Next.js package unavailable in assistant worktree. |
| `npm audit --json` | BLOCKED | `package-lock.json` absent; registry DNS requests timed out. Exact 7 moderate advisories cannot be triaged without lockfile/report. |
| Supabase migration / pgTAP | NOT RUN | No Supabase CLI, Postgres (`psql`) or Docker in runtime. Test file contains `plan(23)` and 23 assertions. |
| Playwright / browser viewport QA | NOT RUN | No browser test execution/screenshots in this runtime. |

## Owner-reported Windows baseline (before expanded backend code)

Owner reports Node.js 24.14.0, npm 11.21.1, Next 16.4.6, React 19.3.0; `npm install` installed 358 packages; dev server ran; `/`, `/about`, `/support`, `/shop` returned HTTP 200; `npm run typecheck` passed; six then-existing tests passed; `npm run build` passed. `npm run lint` failed with `TypeError: Converting circular structure to JSON` under the prior FlatCompat config. `npm audit` reported seven moderate vulnerabilities.

These owner-reported results predate the expanded backend code and are not proof that the latest source passes. The ESLint configuration was subsequently migrated to the Next 16 flat config (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`) but needs execution on the owner's installed dependency tree.

## Required next verification

1. Add the current Windows `package-lock.json` to the working tree and run `npm ci`.
2. Run typecheck, lint, test and production build against this exact source; record full outputs.
3. Run `npm audit --json`; review package paths and compatible patches before modifying versions.
4. Start local Supabase; apply migration; run `supabase test db` against a disposable project.
5. Add DB fixture tests and Playwright flows at the four required viewports.
