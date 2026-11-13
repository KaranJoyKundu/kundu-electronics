# Dependency security remediation — GHSA-g3hv-75wg-m249

**Date:** 2026-11-13  
**Repository:** KaranJoyKundu/kundu-electronics  
**Branch:** feat/storefront-foundation  
**Inspected branch head:** bc2f28dd99f5ef7f51e575a3bb0aa896ab8543e3  
**Lockfile blob:** 9149ef79013ed92efeb6eb325e2896ad31b3ea23

## Decision

**Do not apply a dependency override or update the lockfile yet.** The lockfile's TypeScript-ESLint dependency explicitly requires minimatch 10.x. The advisory's first patched version is 11.0.1, which is outside that semver range. No stable, registry-published TypeScript-ESLint release with a compatible updated dependency was verified in this investigation. A forced override would create an invalid dependency tree and could break linting. Keep the existing passing application dependency versions unchanged until a compatible upstream release is published.

This is a documented residual finding, not a claim that the vulnerability has been remediated.

## Evidence from the committed package-lock.json

The lockfile is v3. The relevant installed entries are:

| Lockfile path | Version | Lockfile dependency |
|---|---:|---|
| node_modules/@typescript-eslint/typescript-estree | 8.72.2 | minimatch: ^10.2.2 |
| node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch | 10.2.6 | brace-expansion: ^5.0.8 |
| node_modules/minimatch | 3.1.5 | brace-expansion: ^1.1.7 |

The vulnerable instance is the nested 10.2.6 copy. The root 3.1.5 copy is outside this advisory's affected range (>=7.0.0, <11.0.1) and must not be changed as part of this remediation.

The lockfile dependency edges referencing minimatch are:

- @typescript-eslint/typescript-estree@8.72.2 -> ^10.2.2 (nested vulnerable copy).
- @eslint/config-array@0.21.2 -> ^3.1.5.
- @eslint/eslintrc@3.3.7 -> ^3.1.5.
- eslint@9.39.5 -> ^3.1.5.
- eslint-plugin-import@2.32.0 -> ^3.1.2.
- eslint-plugin-jsx-a11y@6.10.2 -> ^3.1.2.
- eslint-plugin-react@7.37.5 -> ^3.1.2.

Thus only the TypeScript-ESTree edge selects the affected major. The other listed consumers use the 3.x copy.

## Upstream compatibility assessment

- Advisory GHSA-g3hv-75wg-m249 affects minimatch >=7.0.0 and <11.0.1; patched release: 11.0.1.
- The installed TypeScript-ESTree 8.72.2 lockfile metadata declares ^10.2.2. Semver ^10.2.2 does not accept 11.0.1.
- The npm package page identified 8.72.2 as the latest stable TypeScript-ESTree version during this check. The upstream repository's current package manifest showed a proposed/updated minimatch ^11.0.1 requirement, but that repository manifest alone does not prove a corresponding stable npm release exists. Do not synthesize a release or edit lockfile metadata by hand.
- The safe resolution is to wait for a stable TypeScript-ESLint release whose published package manifest accepts minimatch >=11.0.1, then update the coordinated TypeScript-ESLint package family using the supported compatible release and regenerate the lockfile with npm.
- Re-evaluate every remaining minimatch instance after the update. Do not globally override minimatch 11 into consumers requiring 3.x, 9.x or 10.x.

## Commands and execution limits

The GitHub integration provided repository file contents, but it does not provide a shell in the user's Windows checkout. Consequently these commands were **not executed in this session**:

- npm explain minimatch
- npm ls minimatch --all
- npm audit fix --dry-run
- npm ci
- npm ls --depth=0
- npm run typecheck
- npm run lint
- npm test
- npm run build
- npm audit

The graph above is derived directly from the committed lockfile's package entries and dependency declarations; it is not represented as output from npm explain. The owner previously reported that npm ci, typecheck, lint, 42 tests and build passed on Windows before this dependency-only investigation. Those owner-reported results are preserved but were not rerun here.

## Next safe remediation procedure

When a stable compatible TypeScript-ESLint release is available:

1. On the feature branch, inspect its published package manifest and confirm its minimatch range includes >=11.0.1.
2. Update the TypeScript-ESLint package family coherently; do not independently pin internal packages to mismatched versions.
3. Run npm install to regenerate package-lock.json, then inspect the diff.
4. Run npm ci.
5. Run npm explain minimatch and npm ls minimatch --all. Confirm no affected 7.x–10.x copies remain.
6. Run npm audit and inspect the full JSON report.
7. Run npm run typecheck, npm run lint, npm test and npm run build.
8. Commit the package manifest/lockfile and test report together on feat/storefront-foundation only.

Until then, keep the seven audit entries visible and tracked. Do not suppress the audit finding, add an allowlist, or claim zero vulnerabilities.

## Next.js TypeScript checker setting

The repository's next.config.ts sets experimental.useTypeScriptCli to false. This is an actual Next.js 16 experimental configuration flag, not an invented setting. Next.js issue #96620 documents the stale .next/dev/types route-validator failure in the TypeScript CLI path and explains why the TypeScript API checker filters those development type files. Keeping false selects that API checker and is a targeted workaround; it does not disable strict TypeScript checking or ignore build errors. The observed "⨯ useTypeScriptCli" line is consistent with the experiment being disabled. Preserve the setting unless a verified Next.js release fixes the CLI path and Windows verification demonstrates the change is safe.

## Sources

- GitHub advisory: https://github.com/advisories/GHSA-g3hv-75wg-m249
- TypeScript-ESTree npm package: https://www.npmjs.com/package/@typescript-eslint/typescript-estree
- Upstream TypeScript-ESTree package manifest: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-estree/package.json
- Next.js issue on stale dev route types and TypeScript CLI: https://github.com/vercel/next.js/issues/96620
