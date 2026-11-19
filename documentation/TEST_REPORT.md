# TEST_REPORT — Kundu Electronics

## Checkout payment options update — PR #14

**Feature branch:** `feat/checkout-payment-options`  
**Code commit verified by CI:** `76b3e482846aec844ee3a526154d7ad62a8e60ce`  
**Latest documentation commit:** `5c5907e360a4c227238d0f867edb62b1864b574d`  
**PR:** https://github.com/KaranJoyKundu/kundu-electronics/pull/14  
**Windows CI run #207:** https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44638048525  
**Vercel preview:** https://kundu-electronics-k18sma375-kundu2409056-5098.vercel.app  
**Vercel preview deployment:** `dpl_4Jz42UiBM2k8mgH1QLZTYMhyepuF` (**READY**, feature branch code commit).

Windows CI #207 completed successfully:
- Typecheck: passed.
- Lint: passed.
- Tests: passed.
- Production build: passed.
- Full dependency audit: passed.
- Production-only dependency audit: passed.
- Read-only npm audit fix investigation: passed.

Vercel preview compiled successfully, completed TypeScript checks, generated all 28 static pages/routes and reached **READY**. The preview `/cart` and `/shop` routes returned HTTP 200. The `/cart` response exposed the configured receiving number through the public checkout configuration. The deployed cart JavaScript bundle contains the Cash on delivery, bKash/Nagad, TrxID, Reference and Suggestions labels.

Supabase configuration was updated (without a schema change): both `bkash` and `nagad` payment-method rows are enabled with the owner-provided receiving number `01735530174`. `get_public_checkout_config()` returns both methods.

Important verification limits:
- No real order or payment submission was created for testing.
- No bKash/Nagad transfer was performed.
- No interactive browser test filled and submitted a cart; the preview checks verified the build, route responses and deployed bundle strings only.
- The online-payment form is intentionally available only after the server confirms an order is `awaiting_payment`. Untracked/build-to-order products stay blocked at `pending_stock_confirmation` until staff confirms stock and amount.
- Transaction references remain `pending_verification` until an authorized admin checks them.

**Latest release:** 19 November 2026 (Asia/Dhaka)  
**Production branch:** `main`  
**Production commit:** `655030e3900823c8f2ceaf2ce3083c19ceea058b`  
**Vercel production deployment:** `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb` (**READY**)  
**PR:** #11 merged  
**Windows CI:** run #188 — https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096

## Windows CI results

Runner: Windows Server 2025, Node.js 24.22.2, npm 11.19.1.

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | **PASS** | Clean install; 374 packages added. |
| `npm run typecheck` | **PASS** | Completed successfully. |
| `npm run lint` | **PASS** | Completed successfully after clearing apostrophe, effect-state, navigation, image-element and unused-state warnings. |
| `npm test` | **PASS — 44 passed, 0 failed** | All existing tests plus search-expansion coverage. |
| `npm run build` | **PASS** | Next.js production build compiled, typechecked and generated all 28 static pages/routes successfully. |
| Full `npm audit --json` | **PASS — 0 findings** | 0 critical, 0 high, 0 moderate, 0 low. |
| `npm audit --omit=dev --json` | **PASS — 0 findings** | Production dependency graph clear. |
| `npm audit fix --dry-run` investigation | **PASS** | Existing read-only dependency investigation completed. |

The complete audit CI job now fails on any known finding in development or production dependencies. The production-only lane remains separate to identify deploy-time risk. The prior picomatch GHSA-fc5q-39xc-vjpf / CVE-2026-112366 notice was withdrawn by GitHub on 18 November 2026: https://github.com/advisories/GHSA-fc5q-39xc-vjpf. It is no longer a current npm audit finding.

## Production deployment and smoke tests

The merged commit `655030e3900823c8f2ceaf2ce3083c19ceea058b` is deployed to the canonical `https://kundu-electronics.vercel.app` domain. Vercel reports deployment `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb` as **READY**.

The following production pages returned HTTP 200:
- Homepage, shop, projects.
- LFR, Soccer Bot, RC Speed Battle and Drone project pages.
- Image credits.
- `/robots.txt` and `/sitemap.xml`.

API checks:
- `/api/catalog/search?query=b` returned P079 and P080 Breadboard first.
- `/api/catalog/search?query=breadboard` returned both Breadboard products.
- `/api/catalog/products?min=0&max=200&page=1` returned matching filtered products.
- LFR, Soccer Bot and RC kit product detail routes returned HTTP 200.

Image checks:
- Optimized P021 Arduino Nano and Bee case-study image URLs returned HTTP 200 with image/jpeg content type.
- Logo returned HTTP 200 with image/png.
- The new project showcase contains approved local component image collages for LFR/Soccer/RC and an original Drone concept illustration; no third-party robot build photos are presented as Kundu builds.

Security-header checks on the canonical production response:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

## Supabase migration and live database

Migration `20261119094342_security_and_fk_index_hardening` was applied to project `tcapxmiroikbsozvucmt`:
- Added 11 FK indexes.
- Revoked anon/authenticated direct execute on `has_store_role`.
- Revoked anon execute on `is_store_admin` and `is_store_staff`, keeping authenticated execute for RLS policies.
- Kept `rate_limit_windows` without client grants/policies; only service-role RPC access.

Read-only live data:
- 220 product rows total; 208 published and 12 archived.
- 18 published categories.
- 199 published original SKUs plus nine kits.
- 49 products with no verified selling price.
- Availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order, six unknown.
- Orders: zero; payment submissions: zero.
- Checkout enabled for unpaid order requests; bKash/Nagad disabled.

## Not covered by this verification

- Full interactive Playwright/manual visual and responsive tests at 1440×900, 1366×768, 768×1024, 390×844 and 360×800 were not executed in this tool session.
- Full WCAG 2.2 AA manual/automated browser audit and Lighthouse desktop/mobile performance report remain outstanding.
- Owner magic-link sign-in and protected admin browser session were not verified.
- Supabase Auth leaked-password protection remains disabled; owner dashboard action required if plan supports it.
- The 49 null selling prices and six unknown availability values require owner confirmation; none were guessed.
- bKash/Nagad receiving details and customer instructions are missing; methods remain disabled.

Do not interpret HTTP 200, green CI or npm audit zero findings as proof of perfect security or a substitute for the manual/browser/owner checks above.

---

## Historical verification notes

The following sections are retained as historical project notes from earlier November test runs. They are superseded by the 19 November release results above.

# TEST_REPORT — Kundu Electronics

**Last updated:** 13 November 2026 (Asia/Dhaka)
**Branch:** `feat/storefront-foundation`
**Base commit for this follow-up:** `5949f4cd3152aa595dd6433aaac27a7b85f3a87a`

## Latest follow-up verification in the assistant runtime

Runtime: Node.js `v22.16.0`, npm `10.9.2`, global TypeScript `5.8.3`. This differs from the owner's Windows environment (Node `24.14.0`, npm `11.21.1`) and does not have project dependencies installed.

| Command/check | Result | Details |
|---|---|---|
| `npm test` | **PASS — 42 passed, 0 failed** | All project Node test files, including new payment-method and order-summary parser tests. |
| Targeted strict TypeScript | **PASS** | `payment-methods.ts` and `order-summary.ts` compile with `tsc --noEmit --strict`; does not typecheck the full Next app. |
| `git diff --check` | **PASS** | Executed after the final documentation edits; clean. |
| TypeScript/TSX syntax scan | **PASS — 78 files, 0 diagnostics** | TypeScript 5.8.3 `transpileModule`; syntax-only. |
| `npm run typecheck` | **BLOCKED — exit 127** | `next: not found`; project `node_modules` is absent. |
| `npm run lint` | **BLOCKED — exit 127** | `eslint: not found`; project `node_modules` is absent. |
| `npm run build` | **BLOCKED — exit 127** | `next: not found`; no Next production build could run. |
| `npm audit` | **BLOCKED — `ENOLOCK`** | No `package-lock.json` or shrinkwrap file in the assistant worktree, supplied project archive or GitHub branch. |
| Dependency install | **BLOCKED** | npm registry lookup failed with `EAI_AGAIN registry.npmjs.org`; package versions were not changed. |

The unit-test command was run as:

```text
npm test
# tests 42
# pass 42
# fail 0
# cancelled 0
# skipped 0
```

The full five-command Windows verification has **not** been demonstrated for this follow-up. The prior owner report (before these latest changes) was 1 type error, 2 lint errors, 1 warning, 38 tests passed and build compilation followed by TS failure. Do not treat that earlier build as passing this new source.

## Owner-supplied Windows history

Environment supplied by the owner: Windows PowerShell 5.1, Node.js 24.14.0, npm 11.21.1, Next.js 16.4.6, React 19.3.0, ESLint 9.39.5.

| Check | Owner result before this follow-up |
|---|---|
| `npm install` | PASS — 374 packages audited |
| `npm run typecheck` | FAIL — one TypeScript error at `src/data/storefront.ts:198` |
| `npm run lint` | FAIL — two errors and one warning |
| `npm test` | PASS — 38 passed |
| `npm run build` | Compiled, then failed during TypeScript checking |
| `npm audit` | Previous supplied report: 7 moderate indirect findings |

## Source-level fixes in this follow-up

### Payment method parsing (`src/data/storefront.ts`)

- Moved runtime parsing into `src/lib/checkout/payment-methods.ts`.
- The parser accepts only `"bkash"` or `"nagad"`, with non-empty receiving number and instructions.
- Unsupported methods and malformed entries are discarded; no assertion is used to coerce arbitrary strings to the union.
- `PublicCheckoutConfig.paymentMethods` now uses the shared typed interface.
- Two regression tests cover valid, unsupported, malformed and incomplete records.

### Order confirmation effect (`src/components/orders/order-confirmation-client.tsx`)

- Removed the previous effect-to-stateful-callback call path.
- The effect starts a pure async request and sets keyed result state only in the asynchronous promise completion callbacks.
- Loading/error/success are derived from whether the stored result belongs to the current `orderId`; no synchronous `setLoading(true)` is needed in the effect.
- `AbortController` and monotonically increasing request sequence prevent stale results after navigation, refresh or unmount.
- Manual post-payment refresh uses the same abort/stale-request guard.
- Added `parseOrderSummary` in `src/lib/orders/order-summary.ts` so the API payload is validated from `unknown`, including money, item quantities and bKash/Nagad method; two tests cover valid/rejected and malformed summaries.

### Cart lint fixes

- `src/lib/cart/cart-store.test.ts`: the unchanging storage fixture is `const`.
- `src/components/cart/cart-page-client.tsx`: removed a `useMemo` whose dependency was a conditional array recreated during render. The bounded cart product map is inexpensive and is now built directly; no effect or cart behaviour was removed.

## Next.js 16 route-type mismatch and TypeScript configuration

Next.js 16 with isolated dev builds keeps separate generated route-type output under `.next/dev/types` and `.next/types`. Next 16's current TypeScript template includes both paths to avoid configuration churn. However, a project TypeScript CLI pass that checks two independently generated route maps together can report generated `Route`/`LayoutRoutes` constraint incompatibilities. Upstream Next.js issue #93700 documents the development route-map mismatch signature; issue #96620 documents stale `.next/dev/types` being picked up by the CLI checker. See:

- https://github.com/vercel/next.js/issues/93700
- https://github.com/vercel/next.js/issues/96620
- https://nextjs.org/docs/app/api-reference/cli/next

Configuration changes:

- `tsconfig.json` includes both `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`, consistent with Next 16's current generated template. Next may maintain these include entries automatically; do not hand-edit generated `.next` files.
- New `tsconfig.typecheck.json` extends the base config, includes `.next/types` plus source and `next.config.ts`, and excludes `.next/dev`.
- `npm run typecheck` now runs `next typegen && tsc --project tsconfig.typecheck.json --noEmit --incremental false`.
- `next.config.ts` sets `experimental.useTypeScriptCli: false` for the Next 16.4.x build path. Next's TypeScript API checker filters dev type files during production checks; this avoids the CLI path described in issue #96620 checking stale/incompatible dev validators. This setting is version-specific and must be verified with the owner's installed Next 16.4.6 build. It does not weaken `strict` or ignore build errors.

The actual Windows `.next/dev/types/validator.ts` and both generated route maps were not uploaded. This diagnosis is based on the reported path/error signature plus the upstream Next issue; it is not a direct inspection of the owner's generated file. If the error persists, collect those three generated files and the exact `tsconfig.json` after Next modifies it.

## npm audit assessment from the supplied JSON

The available supplied `/mnt/data/npm-audit.json` is UTF-16LE. It reports 7 moderate, 0 low, 0 high and 0 critical findings across 447 dependencies. All seven are marked indirect (`isDirect: false`) and `fixAvailable: true`.

| Flagged package | Severity | Reported affected range / installed path | Relationship |
|---|---|---|---|
| `@typescript-eslint/eslint-plugin` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/eslint-plugin` | Roll-up through `type-utils` and `utils` |
| `@typescript-eslint/parser` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/parser` | Roll-up through `typescript-estree` |
| `@typescript-eslint/type-utils` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/type-utils` | Roll-up through `typescript-estree` and `utils` |
| `@typescript-eslint/typescript-estree` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/typescript-estree` | Depends on vulnerable `minimatch` |
| `@typescript-eslint/utils` | Moderate | `6.16.0 - 8.72.2`; `node_modules/@typescript-eslint/utils` | Roll-up through `typescript-estree` |
| `minimatch` | Moderate | `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`; advisory-affected range `>=7.0.0 <11.0.1` | Root advisory GHSA-g3hv-75wg-m249 / CVE-2026-118764 |
| `typescript-eslint` | Moderate | `<=8.72.2`; `node_modules/typescript-eslint` | Aggregate of TypeScript-ESLint packages above |

The reported root advisory describes denial of service via glob-part amplification (CWE-405), with `11.0.1` listed as patched: https://github.com/advisories/GHSA-g3hv-75wg-m249. The JSON does not provide exact installed versions or a complete dependency resolution map. The actual Windows `package-lock.json` was neither uploaded nor committed to the repository (the branch tree contains `tsconfig.json` but no lockfile). Therefore no package upgrade, override or `npm audit fix` has been attempted.

Safe next steps on Windows, after providing the actual lockfile and fresh audit output:

```powershell
npm audit fix --dry-run --json
npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser @typescript-eslint/typescript-estree minimatch typescript-eslint
```

Only apply ordinary `npm audit fix` after checking that all proposed updates stay within compatible semver ranges and rerun the full checks. Do not use `npm audit fix --force` or a blanket `minimatch@11` override without validating parent dependency ranges.

## Security review

- No `any`, `@ts-ignore`, lint suppression or weakened `strict` flag was introduced in this follow-up.
- Payment configuration and order-status API data are runtime-validated before entering typed UI state.
- No public buying-price, margin, supplier or raw business data was added.
- No environment secrets, `.env.local` or service-role key was committed.
- Cart quantities/prices remain non-authoritative; checkout continues to recalculate against the database.
- Supabase RLS/SQL integration, customer data isolation and payment verification still require staging tests.

## Remaining blockers

1. Obtain and inspect the owner's actual Windows `package-lock.json` and fresh `npm-audit.json` before dependency decisions.
2. Import these source changes on Windows and run the full typecheck, lint, tests, production build and audit with Node 24/npm 11.
3. Verify that the owner-reported React hooks errors and warning are gone; no lint run could execute here because ESLint is not installed.
4. If Next route types still fail, inspect `.next/dev/types/validator.ts`, `.next/dev/types/routes.d.ts`, `.next/types/routes.d.ts`, and the exact post-typegen tsconfig.
5. Run SQL/pgTAP/RLS/concurrency tests on disposable Supabase and browser/Playwright tests.


## 2026-11-13 dependency-security follow-up

- The committed Windows lockfile is now present on the remote feature branch. Lockfile v3 resolves `@typescript-eslint/typescript-estree@8.72.2` with nested `minimatch@10.2.6` (declared `^10.2.2`); a separate root `minimatch@3.1.5` serves ESLint plugins and is outside this advisory's affected range.
- GHSA-g3hv-75wg-m249 is fixed upstream in minimatch `11.0.1`, but 11.x does not satisfy the TypeScript-ESTree `^10.2.2` dependency range. Do not force an override or hand-edit lockfile metadata. No dependency versions were changed. Track the advisory until a stable TypeScript-ESLint release declares a compatible minimatch 11 range.
- Current stable `@typescript-eslint/typescript-estree` observed on npm is `8.72.2`; `8.72.3-alpha.8` is a prerelease and is not suitable as a production dependency update without explicit prerelease evaluation.
- Next.js `v16.4.6` source was inspected: `useTypeScriptCli` is an accepted boolean in `config-schema.ts`; `false` selects the TypeScript API worker in `packages/next/src/build/type-check.ts`. `runTypeCheck.ts` explicitly filters `.next/dev/types` during build typechecking. Keep the setting pending owner verification; the warning marker is consistent with the disabled experimental CLI checker, not an unknown config property.
- GitHub integration can inspect repository files but cannot run npm commands in the owner's Windows environment or produce a full Git bundle from the connected remote. `npm explain`, `npm ls`, `npm audit fix --dry-run`, `npm ci`, typecheck, lint, tests and build were not executed in this session. Preserve the owner's prior Windows PASS report; it is not a rerun for this security follow-up.
