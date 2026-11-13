# TEST_REPORT — Kundu Electronics

**Last updated:** 13 November 2026 (Asia/Dhaka)
**Branch:** `feat/storefront-foundation`
**Base commit:** `de253ee264ff6af743bb4ca18ae88964b680aa63`

## Owner-reported Windows results for the pre-fix source

Environment: Windows PowerShell 5.1, Node.js 24.14.0, npm 11.21.1, Next.js 16.4.6, React 19.3.0, ESLint 9.39.5.

| Check | Owner result before this remediation |
|---|---|
| `npm install` | PASS — 374 packages audited |
| `npm run dev` | PASS — development server started |
| Homepage, About, Support, Shop | PASS — HTTP 200 |
| `npm run typecheck` | FAIL — 6 errors described in owner report |
| `npm run lint` | FAIL — 4 errors and 2 warnings described in owner report |
| `npm test` | PASS — 23 passed, 0 failed |
| `npm run build` | Compiled, then failed during TypeScript checking |
| `npm audit` | 7 moderate vulnerabilities; see the audit section below |

These are owner-supplied results for the source before the current fixes. They must not be presented as results of the modified source.

## Checks executed in this assistant runtime after the remediation edits

| Check | Result | Evidence / limitation |
|---|---|---|
| `npm test` | **PASS — 38 passed, 0 failed** | Re-run after adding cart hydration and persistence tests. Includes catalogue matching/filtering, query validation, response parsing, cart store, checkout validation/idempotency, image signature and Supabase RPC parser tests. |
| `git diff --check` | **PASS** | Final whitespace check rerun after documentation edits. |
| Targeted strict TypeScript check | **PASS** | `tsc --noEmit --strict` on dependency-free cart/catalogue/RPC boundary modules. Not the whole Next application. |
| TypeScript/TSX syntax scan | **PASS — 74 files, 0 diagnostics** | Transpile-only syntax scan across all `src/**/*.ts` and `src/**/*.tsx`. Syntax-only, not `tsc`. |
| `npm run typecheck` | **BLOCKED — exit 127** | `next: not found`; this runtime has no `node_modules`. The script now runs `next typegen` before `tsc`. |
| `npm run lint` | **BLOCKED — exit 127** | `eslint: not found`; ESLint 9 flat config is present but cannot execute without installed dependencies. |
| `npm run build` | **BLOCKED — exit 127** | `next: not found`; no production build was run in this runtime. |
| `npm audit --json` | **BLOCKED — `ENOLOCK`** | No `package-lock.json` exists in this worktree. The supplied audit JSON was analysed; npm cannot produce a fresh audit tree without the lockfile. |
| `npm ci` / install | **BLOCKED** | Registry DNS previously failed with `EAI_AGAIN registry.npmjs.org`; no local dependency install is available here. |
| Supabase migration and pgTAP | **NOT RUN** | No Supabase CLI, Postgres or Docker in this runtime. The SQL security contract is separate from these frontend tests. |
| Playwright/browser QA | **NOT RUN** | No browser automation/screenshots executed in this runtime. |

### Reproducible commands

The following dependency-free strict check passed for the selected application boundary modules:

```powershell
tsc --noEmit --strict --target ES2022 --lib ES2022,DOM --module ESNext --moduleResolution Bundler --allowImportingTsExtensions `
  src/lib/cart/types.ts `
  src/lib/cart/cart-store.ts `
  src/lib/catalog/types.ts `
  src/lib/catalog/query.ts `
  src/lib/catalog/response.ts `
  src/lib/catalog/cart-pricing.ts `
  src/lib/supabase/catalog-search.ts
```

Run the full owner environment verification on the exact updated branch after restoring the committed lockfile:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --json
```

## Root-cause remediation summary

### TypeScript

- **Generated `.next/dev/types/validator.ts` Route mismatch:** the broad `**/*.ts` include can pull `.next/dev/types` validator files into the same TypeScript program as production `.next/types`. Next.js 16's isolated development build keeps separate generated route maps in `.next/dev` and `.next`; production-phase type generation writes the type set used by the standalone check. Two current Next.js issues document this failure mode: issue #93700 reproduces the exact pair of `Route`/`LayoutRoutes` constraint errors in `.next/dev/types/validator.ts` when dev and production route maps diverge, and issue #96620 documents stale isolated-dev validator typechecking. The project now excludes `.next/dev`, includes `.next/types`, and runs `next typegen` before `tsc`. No generated file was edited. The actual generated Windows file and route maps were not attached, so this is a strongly supported diagnosis from the path/signature, not direct inspection. See https://github.com/vercel/next.js/issues/93700, https://github.com/vercel/next.js/issues/96620 and https://nextjs.org/docs/app/api-reference/cli/next. The official CLI documentation confirms that `next typegen` regenerates route definitions before a standalone `tsc` run and that its output directory depends on `isolatedDevBuild`.
- **Implicit `any` in catalogue API rows:** Supabase RPC output is untyped at the boundary. `parseCatalogSearchRows(unknown)` now validates and narrows each row before either route maps it.
- **Payment `method: string`:** the runtime value is retained in a local variable and narrowed against the two supported literals before constructing typed checkout configuration.

### React hooks and accessibility

- Cart hydration/persistence moved from effect-driven component state into a small external store consumed through `useSyncExternalStore`. Tests cover persisted initial state and write persistence, malformed storage, invalid quantities and blocked storage fallback.
- Cart product loading derives loading/error/empty state from a memoized request identity. Effects only update result state after asynchronous fetch completion and abort stale requests.
- Order refresh uses a memoized `refreshOrder` callback with the correct dependency and an `AbortController` cleanup.
- Search suggestions/loading derive from the current query and the last query-keyed async result. Input declares `role="combobox"` with listbox semantics, making `aria-expanded` valid for its explicit role.
- No lint rule was disabled. A runtime ESLint pass is still pending because ESLint is not installed in this worktree.

## npm audit assessment from the supplied JSON

The attachment reports 7 moderate, 0 low, 0 high and 0 critical vulnerabilities across 447 dependencies. All seven flagged entries are marked indirect (`isDirect: false`) and `fixAvailable: true`.

| Flagged package | Severity | Reported range / path | Relationship |
|---|---|---|---|
| `@typescript-eslint/eslint-plugin` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/eslint-plugin` | Roll-up through `type-utils` and `utils` |
| `@typescript-eslint/parser` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/parser` | Roll-up through `typescript-estree` |
| `@typescript-eslint/type-utils` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/type-utils` | Roll-up through `typescript-estree` and `utils` |
| `@typescript-eslint/typescript-estree` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/typescript-estree` | Depends on vulnerable `minimatch` |
| `@typescript-eslint/utils` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/utils` | Roll-up through `typescript-estree` |
| `minimatch` | Moderate | Installed path `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`; affected version range `>=7.0.0 <11.0.1` | Root advisory GHSA-g3hv-75wg-m249 / CVE-2026-118764 |
| `typescript-eslint` | Moderate | `<=8.72.2`; `node_modules/typescript-eslint` | Aggregate of TypeScript-ESLint packages above |

The GitHub-reviewed advisory describes a potential denial of service through attacker-controlled glob-part amplification (CWE-405). It lists `11.0.1` as the patched minimatch version: https://github.com/advisories/GHSA-g3hv-75wg-m249.

The supplied report does **not** contain exact installed package versions or a full `packages` resolution map. It reports `fixAvailable: true`, but that flag alone does not show which safe semver-compatible update npm intends to apply. No override, forced update or dependency bump was made. A `package-lock.json` from the owner's actual Windows install is required to inspect the exact tree and a dry-run remediation plan.

Recommended safe Windows sequence after supplying/committing the lockfile:

```powershell
npm audit fix --dry-run --json
npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser @typescript-eslint/typescript-estree minimatch typescript-eslint
```

Review the dry-run's package changes first. Apply plain `npm audit fix` only if the proposed updates remain within compatible package ranges, then repeat typecheck, lint, tests, build and audit. Do not use `npm audit fix --force` or a blanket `minimatch@11` override without verifying the parent packages' declared ranges and tests.

## Security review performed

- New API boundaries accept RPC/JSON data as `unknown` and validate before application use.
- Catalogue query parsing restricts price bounds, sorting, category slug, query length/control characters and page range.
- Payment method union is narrowed from runtime data.
- No `any`, `@ts-ignore`, or ESLint-disable directive was added as part of this remediation.
- No business master workbook, buying-price field, supplier record, API credential or `.env.local` was added to the Git worktree.
- Public Product types remain selling-price-only.

## Remaining verification blockers

1. Obtain the actual Windows `package-lock.json` and preferably have it committed to this private repository; it is not in the current checkout or uploaded artifacts.
2. Run `npm ci` on the latest branch, then the four full checks and a fresh `npm audit`.
3. If lint/typecheck report new errors, fix them without weakening strictness or suppressing rules.
4. Apply migration to disposable Supabase local/staging and run the security tests.
5. Run real browser flows at desktop, tablet and mobile viewports.
