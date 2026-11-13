# TypeScript, ESLint and npm audit remediation

**Prepared:** 13 November 2026 (Asia/Dhaka)
**Branch:** `feat/storefront-foundation`
**Base:** `de253ee264ff6af743bb4ca18ae88964b680aa63`

## Scope and evidence boundary

The owner supplied the failing Windows checks and an `npm-audit.json` report. The repository snapshot available in this execution contains `package.json` but no `package-lock.json` or `node_modules`. The npm registry is not resolvable from this runtime (`EAI_AGAIN registry.npmjs.org`). Consequently, source-level changes and dependency-free checks are performed here, but the complete Next/ESLint command suite cannot be truthfully marked as passing.

## TypeScript findings and changes

| Reported failure | Root cause | Change |
|---|---|---|
| `.next/dev/types/validator.ts:30`, two `Route` constraint errors | Next.js 16 has isolated production and development type output directories. The broad `**/*.ts` include could pull generated files from `.next/dev/types` into the TypeScript project alongside production `.next/types` output, allowing two isolated route maps to be checked together. Next.js issue reports document development/production route-type divergence and stale dev validator files. | `tsconfig.json` now includes `.next/types/**/*.ts`, excludes `.next/dev`, and does not edit generated files. `typecheck` runs `next typegen` before `tsc --noEmit --incremental false`, refreshing production route definitions and avoiding stale dev validators. This matches two documented Next.js failure modes: route-map divergence between `.next/dev/types/routes` and `.next/types/routes` (including the `Route`/`LayoutRoutes` constraint family in Next.js issue #93700), and stale isolated-dev validator files being included by the TypeScript CLI path (issue #96620). Because the actual Windows validator file and generated route maps were not attached, the local cause is strongly supported by the path and signature but is not byte-for-byte verified. |
| Products API callback `row` implicit `any` | Supabase RPC `data` is not strongly typed in this repository because generated database types are not connected. Mapping an untyped result directly allowed `row` to become implicit `any`. | `parseCatalogSearchRows(unknown)` validates each RPC record and returns `CatalogSearchRow[]`; both list and search handlers map the explicit result type. |
| Search API callback `row` implicit `any` | Same untyped RPC boundary. | Same runtime parser and explicit row type are used before `.map`. |
| `method: string` not assignable to `"bkash" | "nagad"` | `Record<string, unknown>` lookup does not narrow a property across the returned object unless the narrowed value is retained. | Store `row.method` in `paymentMethod`, validate the two supported literals, then return the narrowed literal union. |

No `any`, `@ts-ignore`, or weakened strict compiler option was added. `strict: true` remains enabled.

## React hooks and accessibility findings

| File | Reported issue | Refactor |
|---|---|---|
| `src/components/cart/cart-provider.tsx` | Synchronous state updates in mount/persistence effects | Replaced duplicated effect-managed `useState`/`localStorage` synchronization with `useSyncExternalStore` and a small external cart store. Server snapshot is empty; the browser snapshot restores persisted lines after hydration. Same-tab updates notify subscribers; storage events synchronize other tabs. |
| `src/components/cart/cart-page-client.tsx` | Reset/loading state setters executed synchronously inside an effect | Product-load state is keyed to a memoized request identity. Loading/error/products are derived during render. State is written only after the async fetch resolves/rejects, with abort handling. |
| `src/components/orders/order-confirmation-client.tsx` | State loading/reset inside effect; missing `refreshOrder` dependency | `refreshOrder` is a `useCallback` keyed by `orderId`, performs state updates only after async fetch completion, accepts an `AbortSignal`, and is listed in the effect dependency array. Cleanup aborts the request. |
| `src/components/search-box.tsx` | Search state reset/loading setters in effect; `aria-expanded` on an implicit textbox role | Search loading/results are derived from a query-keyed result object; effect state updates happen in async fetch completion. Input is explicitly `role="combobox"` with list autocomplete/listbox semantics, so `aria-expanded` is appropriate. Product suggestion JSON is runtime-validated before links render. |

Additional hardening: cart localStorage write failures retain an in-memory snapshot, rather than allowing the next read to overwrite the current-tab cart with stale persisted data. Cart and autocomplete JSON are parsed from `unknown` with explicit shape checks.

## Added tests

- Cart restoration accepts valid product/variant IDs and quantity bounds.
- Cart restoration rejects malformed storage and invalid IDs/quantities.
- Cart state remains usable in the current tab when localStorage writes throw.
- Catalogue list-query parsing covers defaults, page bounds, sort allow-list, category validation, control characters, reversed ranges and the ৳0–৳200 boundary.
- Cart API product JSON validates product IDs, selling price, availability, image, variant and option-value structure.
- Search autocomplete JSON validates identifiers and display fields.
- Supabase catalogue RPC parser validates unknown PostgREST records and safe integer BDT prices.

## npm audit assessment

The supplied `npm-audit.json` contains **7 moderate, 0 high, 0 critical** alerts. All seven entries are indirect (`isDirect: false`) and show `fixAvailable: true`.

The seven package entries are:

1. `@typescript-eslint/eslint-plugin`
2. `@typescript-eslint/parser`
3. `@typescript-eslint/type-utils`
4. `@typescript-eslint/typescript-estree`
5. `@typescript-eslint/utils`
6. `minimatch`
7. `typescript-eslint`

These are not seven unrelated vulnerability roots. The report's only concrete advisory is **GHSA-g3hv-75wg-m249 / CVE-2026-118764** in the nested path `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`. It describes attacker-controlled glob-part amplification and excessive CPU/memory use during minimatch pattern preprocessing. The advisory's affected range is `>=7.0.0 <11.0.1`; the first patched version is `11.0.1`. The six TypeScript-ESLint entries are dependency-chain/effect rollups from that minimatch issue.

The audit file does not contain a `packages` resolution section, so it does not disclose exact installed versions or the complete parent dependency chain. `package-lock.json` is absent from this worktree. `fixAvailable: true` is npm's recommendation flag, not proof that applying a major-version override is compatible. No `overrides`, forced upgrade, or `npm audit fix --force` was added.

**Recommended next action on the owner's Windows clone:** provide/commit the generated `package-lock.json`, run `npm audit fix --dry-run --json`, and inspect the exact proposed package changes. If npm can update the dependency graph without crossing a required major range, apply plain `npm audit fix`, then run `npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser @typescript-eslint/typescript-estree minimatch typescript-eslint` and `npm audit --json` again. If the only available proposal forces minimatch 11 into a parent range that expects an earlier major, do not override blindly; wait for an upstream-compatible release or make a documented tooling-version change with lint/build verification.

## Commands executed in this runtime

| Command/check | Result |
|---|---|
| `npm test` | **38 passed, 0 failed** |
| Strict standalone TypeScript check of dependency-free cart/catalogue/Supabase RPC modules | **Passed** (`tsc --noEmit --strict`, selected source modules) |
| TypeScript/TSX transpile-only syntax scan | **74 files, 0 syntax diagnostics** |
| `npm run typecheck` | **Blocked**: `next: not found` (no `node_modules`) |
| `npm run lint` | **Blocked**: `eslint: not found` (no `node_modules`) |
| `npm run build` | **Blocked**: `next: not found` (no `node_modules`) |
| `npm audit` | **Not rerun**: lockfile absent and registry DNS returned `EAI_AGAIN`; supplied audit report was analysed |

The owner-reported Windows results (23 tests passing before these fixes) are not evidence that the newly edited source passes a full typecheck, lint or build. Repeat those commands on the latest source once the lockfile/dependencies are restored.

## Files changed for this remediation

- `package.json` — run `next typegen` before strict TypeScript check; include new unit-test folders.
- `tsconfig.json` — use production-generated route types and exclude stale isolated development type output.
- `src/components/cart/cart-provider.tsx` — external cart store and `useSyncExternalStore` hydration.
- `src/lib/cart/cart-store.ts`, `src/lib/cart/types.ts`, `src/lib/cart/cart-store.test.ts` — persisted cart snapshot, validation and blocked-storage fallback.
- `src/components/cart/cart-page-client.tsx` — request-keyed async product load and response parsing.
- `src/components/orders/order-confirmation-client.tsx` — abortable memoized refresh callback.
- `src/components/search-box.tsx` — query-derived loading and accessible combobox; validated suggestions.
- `src/lib/catalog/response.ts`, `src/lib/catalog/response.test.ts` — validated public product/search response shapes.
- `src/lib/catalog/query.ts`, `src/lib/catalog/query.test.ts` — catalogue query validation tests.
- `src/app/api/catalog/products/route.ts`, `src/app/api/catalog/search/route.ts` — typed RPC result parsing before mapping.
- `src/lib/supabase/catalog-search.ts`, `src/lib/supabase/catalog-search.test.ts` — unknown-to-typed Supabase RPC parser.
- `src/lib/catalog/cart-pricing.ts` — use relative type-only import for standalone strict verification.
- `src/data/storefront.ts` — narrow payment method literals correctly.
- Project continuity documents — status and blockers updated after this remediation.
