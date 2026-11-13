# ISSUES AND LIMITATIONS

## Blocking integration work

1. No Supabase project or local Postgres/Supabase runtime is connected. The migration, RLS, Storage policies and RPCs are draft code until applied and tested.
2. No `package-lock.json` exists in the assistant worktree. The owner reports `npm install` completed with 374 packages; its generated lockfile has not been supplied. Without it, `npm ci` and exact dependency-version auditing are not possible.
3. The supplied audit JSON reports seven moderate indirect alerts: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/utils`, `minimatch`, and `typescript-eslint`. The root advisory shown is `minimatch` GHSA-g3hv-75wg-m249 / CVE-2026-118764 (CWE-405), at `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`; affected versions are `>=7.0.0 <11.0.1`, patched release 11.0.1. Exact installed versions and compatible remediation require the lockfile. Do not force-upgrade or add a major override blindly.
4. Source-level fixes for the reported implicit-any, payment-method, generated-route-type and React effect/accessibility errors have been applied. Full Next typecheck, ESLint and production build could not be run in the assistant runtime because `node_modules` is absent; user must verify on Windows with the lockfile.
5. SQL/pgTAP tests and concurrency tests have not run. The security-contract file has 23 assertions but needs actual database execution and row/role fixtures.
6. No browser/Playwright screenshots or visual QA have been run after the expanded changes.
7. The assistant-side local `origin` is a bundle path, not the GitHub remote. GitHub refs were verified through the connected integration: `main=d883393` and `feat/storefront-foundation=de253ee`. The verification-fix commit is available in the local feature-branch Git bundle. Import it into the Windows clone, fetch GitHub, verify fast-forward ancestry and push normally. Never force-push.

## Business data gaps

- Original inventory, component price analysis and robot pricing source files referenced by the brief are missing.
- Candidate product records have no confirmed stock quantities or verified image/specification coverage.
- Eight candidate price rows require owner clarification due to alternatives, estimate or range.
- No product has been approved or published.
- Owner has not provided approved product photos and image rights/permissions.

## Store-operation configuration gaps

- Supabase URL, publishable key, server secret and APP_HMAC_SECRET are not configured.
- bKash and Nagad are disabled; receiving numbers and customer instructions are null.
- Delivery zones/charges are not configured; checkout defaults disabled.
- Reservation TTL is null. No automatic reservation expiry is assumed; staff/manual expiry behavior must be reviewed and owner policy agreed.
- Opening hours, delivery SLA, returns/exchange/warranty policies remain unavailable and should not be invented.

## Architecture considerations needing verification

- Product variants intentionally share product-level stock quantities. If the business needs per-variant stock, the schema and inventory keys must be revised before importing those products.
- Payment submission references are manually checked; no bKash/Nagad gateway/API integration is claimed.
- Private product image bucket is used with RLS; verify signed URL creation/read behavior for anon and staff roles against Supabase Storage.
- The SQL migration is large and should be split into ordered migrations after initial local validation; do not edit already-applied migrations in a connected environment—create forward migrations instead.
- Rate limiting depends on server HMAC and service-role RPC. Production must configure trusted deployment IP forwarding or it fails closed where client IP is unavailable.

## Safety

Never commit raw internal business documents or cost/supplier records. Never expose a service-role key, full payment references or customer address in logs/browser. Do not state a pending transaction is paid. Do not enable checkout until payment and delivery configuration are complete and end-to-end tests pass.


## Verification-fix details

- Cart provider uses `useSyncExternalStore`; cart-page/search loading state is derived from request-keyed async results; order refresh is a memoized callback with effect dependency and abort cleanup.
- Search input uses `role="combobox"` and listbox popup semantics so `aria-expanded` is defined for its role. No lint rule suppression is used.
- The TypeScript `row` errors are fixed by narrowing untrusted Supabase RPC payloads through `parseCatalogSearchRows`.
- The generated `.next/dev/types/validator.ts` file is not edited. `tsconfig` excludes `.next/dev` and the project typecheck script generates production route types before `tsc`.
- Unit tests now cover cart persisted snapshot restoration and updates, in addition to query/response validation.
- Assistant-runtime `npm run typecheck`, `npm run lint`, and `npm run build` each exit because Next/ESLint dependencies are absent; `npm audit --json` exits `ENOLOCK` because there is no package lockfile. The supplied audit report is analysed in `TEST_REPORT.md`.

## 2026-11-13 follow-up status after the reported 1 TS / 2 lint / 1 warning failures

- The payment-method string is now parsed by a typed runtime validator that only accepts the literal union `"bkash" | "nagad"`; malformed values cannot pass through as an arbitrary string.
- Order confirmation was refactored so its effect starts an asynchronous request and updates result state only in promise completion handlers. Request cancellation and stale-response checks are retained; no synchronous loading setter runs inside the effect.
- The cart `useMemo` warning is addressed by removing memoization for the inexpensive product-by-ID map; the product list identity no longer invalidates a memo hook every render.
- The unchanging cart test storage fixture is `const`.
- `tsconfig.json` now matches Next 16's dual generated-type include convention; `tsconfig.typecheck.json` excludes `.next/dev`, and `next.config.ts` uses the TypeScript API build checker. This config needs validation on the owner's Windows machine with the generated `.next/dev/types/validator.ts` present.
- The assistant runtime ran 42 unit tests successfully and a strict tsc check of the new payment/order parsers. Full Next typecheck, lint and build were attempted but blocked by missing `node_modules`; npm registry DNS was unavailable. These are not passes.
- `npm audit` was attempted and returned `ENOLOCK`. There is no actual owner `package-lock.json` in the assistant worktree, supplied files or GitHub branch. The previously supplied audit report remains seven moderate indirect TypeScript-ESLint/minimatch findings. No dependency remediation has been attempted.

### Required next evidence

1. Owner's actual Windows `package-lock.json` from the install that produced 374 audited packages.
2. Fresh `npm-audit.json` generated from that lockfile.
3. Output from all five commands on Node 24.14.0/npm 11.21.1: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit`.
4. If route validator still fails: `.next/dev/types/validator.ts`, `.next/dev/types/routes.d.ts`, `.next/types/routes.d.ts`, and the exact post-typegen `tsconfig.json`.


## 2026-11-13 dependency-security follow-up

- The committed Windows lockfile is now present on the remote feature branch. Lockfile v3 resolves `@typescript-eslint/typescript-estree@8.72.2` with nested `minimatch@10.2.6` (declared `^10.2.2`); a separate root `minimatch@3.1.5` serves ESLint plugins and is outside this advisory's affected range.
- GHSA-g3hv-75wg-m249 is fixed upstream in minimatch `11.0.1`, but 11.x does not satisfy the TypeScript-ESTree `^10.2.2` dependency range. Do not force an override or hand-edit lockfile metadata. No dependency versions were changed. Track the advisory until a stable TypeScript-ESLint release declares a compatible minimatch 11 range.
- Current stable `@typescript-eslint/typescript-estree` observed on npm is `8.72.2`; `8.72.3-alpha.8` is a prerelease and is not suitable as a production dependency update without explicit prerelease evaluation.
- Next.js `v16.4.6` source was inspected: `useTypeScriptCli` is an accepted boolean in `config-schema.ts`; `false` selects the TypeScript API worker in `packages/next/src/build/type-check.ts`. `runTypeCheck.ts` explicitly filters `.next/dev/types` during build typechecking. Keep the setting pending owner verification; the warning marker is consistent with the disabled experimental CLI checker, not an unknown config property.
- GitHub integration can inspect repository files but cannot run npm commands in the owner's Windows environment or produce a full Git bundle from the connected remote. `npm explain`, `npm ls`, `npm audit fix --dry-run`, `npm ci`, typecheck, lint, tests and build were not executed in this session. Preserve the owner's prior Windows PASS report; it is not a rerun for this security follow-up.
