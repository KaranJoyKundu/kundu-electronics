# Current security status — 18 November 2026

This section records the current `feat/launch-prep` dependency tree and Windows verification. The 13 November and 17 November notes below are retained as historical context only.

## Current committed dependency tree

Commit `f29d1887bd336ee95a124469d8b54f43d82d963c` updates only `package.json` and `package-lock.json`:

- `typescript-eslint@8.73.0`
- `@typescript-eslint/eslint-plugin@8.73.0`
- `@typescript-eslint/parser@8.73.0`
- `@typescript-eslint/typescript-estree@8.73.0`
- Nested `minimatch@11.0.9`
- `next@16.4.6` and `eslint-config-next@16.4.6` unchanged

The update was generated in a Windows Node 24 job and committed to `feat/launch-prep` only after the candidate tree passed a clean `npm ci`, audit classification, typecheck, lint, tests and production build. The failed automatic push in the first attempt was not forced; the workflow was changed to fetch and rebase the current feature branch before a normal push. The verified commit was then pushed successfully. `main` was not modified.

## Latest candidate audit

The Windows candidate audit reports:

| Severity | Findings |
|---|---:|
| Critical | 0 |
| High | 14 |
| Moderate | 0 |
| Low / info | 0 |
| **Total** | **14** |

All 14 audited package nodes were verified against the candidate lockfile as development-only dependencies. The one direct package entering the affected chain is `eslint-config-next@16.4.6` (a devDependency); the others are transitive lint-tooling packages. Runtime dependencies `next`, `react`, `react-dom` and Supabase clients were not flagged in this report.

The remaining high advisory is GHSA-fc5q-39xc-vjpf, which affects `picomatch <=4.0.7`. The candidate still resolves `picomatch@4.0.7` under `tinyglobby`, so this advisory remains open. A stable patched npm release was not available at the time of the check. The update does not suppress the audit or pretend the package is fixed.

The previous six moderate findings from the TypeScript-ESLint/minimatch chain are eliminated by the stable parser update to `minimatch@11.0.9`.

## Windows verification

Workflow run #44188598920:

- **Windows application verification: success** — clean install, typecheck, lint, tests and production build.
- **Stable TypeScript-ESLint candidate: success** — clean install, 0 moderate/0 critical audit findings, all 14 remaining high findings classified as dev-only, typecheck, lint, tests, production build, artifact upload and guarded feature-branch commit.
- **npm audit against the existing committed lockfile at the start of the run: failure, expected** — it reported the 15 old findings (9 high, 6 moderate) before the candidate update.
- **npm dry-run investigation: success** — full output and package metadata artifact uploaded.

Evidence:

- Windows workflow run #44188598920: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44188598920
- Tested candidate artifact: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44188598920/artifacts/14361087276
- Candidate commit: https://github.com/KaranJoyKundu/kundu-electronics/commit/f29d1887bd336ee95a124469d8b54f43d82d963c

The push triggered a follow-up workflow #44189430563 from `github-actions[bot]`. GitHub marked that run `action_required`; this is a workflow approval gate, not a failed application check. If GitHub still shows it waiting, approve the workflow run from the Actions page before relying on a fresh CI status for the new commit.

## Safe decision

The six moderate findings are fixed by the committed stable release. The 14 high findings remain visible and are still confined to development-only lint tooling. Do not run `npm audit fix --force`, downgrade `eslint-config-next` to 14.x, force an incompatible major via overrides, use an unreviewed Git commit of `picomatch`, or suppress the advisory. Keep this PR in draft until the remaining high advisory has a stable, tested resolution.

---

---

## Historical investigation — 13 November 2026

# Dependency security investigation — GHSA-g3hv-75wg-m249 (historical)

**Date:** 2026-11-13  
**Repository:** KaranJoyKundu/kundu-electronics  
**Branch:** feat/storefront-foundation  
**Branch head inspected before this documentation update:** 9bb11879464be354a14e3093568284ff3ff14ece  
**Committed lockfile blob:** 9149ef79013ed92efeb6eb325e2896ad31b3ea23 (lockfileVersion 3; unchanged)

## Decision

**Do not apply an npm audit fix, override, or TypeScript-ESLint prerelease to the production dependency tree.** The exact Windows `npm audit fix --dry-run --json` returned no package operations. Registry inspection confirms that all 11 packages in the TypeScript-ESLint family have stable `8.72.2` releases, while the only family line declaring the patched minimatch range is `8.72.3-alpha.8` on the `canary` tag. No stable release that updates the affected dependency was published at the time of this check.

The canary package family is internally aligned and its declared Node/TypeScript peer ranges include this project's current Node 24 and TypeScript 5.9.3. That is metadata compatibility only; it is still a prerelease, and it has not been installed and runtime-tested against this repository's complete ESLint/Next.js toolchain. Keep it out of production until a stable coordinated release exists and passes the full Windows workflow.

The residual advisory remains visible. This branch is **not security-clean**.

## 1. Exact lockfile dependency graph

The committed lockfile is v3. Its TypeScript-ESLint entries are aligned at 8.72.2:

| Package | Locked version |
|---|---:|
| `typescript-eslint` | 8.72.2 |
| `@typescript-eslint/eslint-plugin` | 8.72.2 |
| `@typescript-eslint/parser` | 8.72.2 |
| `@typescript-eslint/project-service` | 8.72.2 |
| `@typescript-eslint/scope-manager` | 8.72.2 |
| `@typescript-eslint/tsconfig-utils` | 8.72.2 |
| `@typescript-eslint/type-utils` | 8.72.2 |
| `@typescript-eslint/types` | 8.72.2 |
| `@typescript-eslint/typescript-estree` | 8.72.2 |
| `@typescript-eslint/utils` | 8.72.2 |
| `@typescript-eslint/visitor-keys` | 8.72.2 |

The affected edge is:

- `@typescript-eslint/typescript-estree@8.72.2` declares `minimatch: ^10.2.2`.
- Its nested lockfile entry resolves `minimatch@10.2.6`.
- The advisory GHSA-g3hv-75wg-m249 affects `minimatch >=7.0.0 <11.0.1`; the first patched version is `11.0.1`.
- `^10.2.2` does not admit minimatch 11.0.1.
- The root `node_modules/minimatch@3.1.5` is separate and outside the advisory's affected range. Do not change it as part of this remediation.

Other lockfile consumers such as ESLint and its plugins use the root 3.x copy. Replacing all minimatch entries with 11.x would be an invalid cross-major override for those dependents.

## 2. Windows dry-run against the committed lockfile

The Windows workflow checked out the PR merge ref containing the exact feature-branch lockfile (same blob SHA above), set up Node.js 24, and successfully ran `npm ci` before this dry-run.

Command:

```powershell
npm audit fix --dry-run --json 1> npm-audit-fix-dry-run.json 2> npm-audit-fix-dry-run-stderr.txt
```

Environment recorded in the GitHub Actions log:

- Windows Server runner (`windows-latest`)
- Node.js `v24.22.2`
- npm `11.19.1`
- `npm ci` completed successfully before the dry-run.
- Dry-run exit code: **1**
- stdout JSON: 4,643 bytes
- stderr: 0 bytes

Actual top-level dry-run result:

| Field | Value |
|---|---:|
| `add` | `[]` |
| `added` | 0 |
| `change` | `[]` |
| `changed` | 0 |
| `remove` | `[]` |
| `removed` | 0 |
| `audited` | 374 |
| vulnerabilities remaining in embedded audit | 7 moderate |

The embedded dry-run audit still lists the same seven moderate entries and still shows `fixAvailable: true` for each. **Despite those flags, npm proposed no package/version changes at all.** Thus there are no npm-proposed target versions to list; all three operation arrays are empty. The non-zero exit code is preserved, not suppressed.

This resolves the reported discrepancy: the audit JSON's `fixAvailable` boolean is not a concrete install plan. The CLI's actual dry-run plan is authoritative for what it would change in this lockfile, and that plan changes nothing. The audit report still detects the vulnerability chain through the locked stable packages.

Complete evidence:

- Workflow run #10: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/43354036175
- `npm-audit-fix-dry-run` artifact (contains full stdout JSON, stderr, exit code, and published stable/canary metadata): https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/43354036175/artifacts/14004179897
- The raw full JSON is also preserved in the artifact as `npm-audit-fix-dry-run.json`. Do not reconstruct it from this summary; use the artifact as the complete command output.

## 3. Published TypeScript-ESLint family metadata

A Windows Node 24 workflow job queried npm registry metadata for each package's `latest` and `canary` dist-tag using `npm view`. All 22 metadata requests (11 packages × 2 tags) returned exit code 0.

| Package | `latest` | `canary` |
|---|---:|---:|
| `typescript-eslint` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/eslint-plugin` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/parser` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/project-service` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/scope-manager` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/tsconfig-utils` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/type-utils` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/types` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/typescript-estree` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/utils` | 8.72.2 | 8.72.3-alpha.8 |
| `@typescript-eslint/visitor-keys` | 8.72.2 | 8.72.3-alpha.8 |

### Canary dependency and peer compatibility

The canary is not a lone transitive package: the published umbrella package and all ten `@typescript-eslint/*` packages queried have matching `8.72.3-alpha.8` canary versions. Their published dependency metadata pins the core family edges to the matching alpha version (the project-service package uses matching `^8.72.3-alpha.8` ranges for its family dependencies).

- Canary `typescript-estree@8.72.3-alpha.8` changes the minimatch declaration to `^11.0.1`, which admits the patched minimatch release.
- The canary family declares Node engines `^18.18.0 || ^20.9.0 || >=21.1.0`, which includes Node 24.
- Its TypeScript peer range is `>=4.8.4 <6.1.0`. This repository's lockfile resolves TypeScript `5.9.3`, which is within that range.
- The canary TypeScript-ESTree manifest also declares an optional `@typescript/native` peer alias for TypeScript 7 development/beta builds. It is optional, so it does not require replacing this project's TypeScript 5.9.3.
- These checks demonstrate that the published canary family is structurally aligned and its declared runtime/peer ranges accept the repository's current Node and TypeScript versions. They do **not** demonstrate that the alpha parser and rules behave correctly in this app's actual ESLint and Next.js configuration.

### Why the canary is not adopted

- `8.72.3-alpha.8` is published under the `canary` tag; `8.72.2` is still the stable `latest` tag across the family at this check.
- It is prerelease software, not a stable security patch. Semver prerelease handling is intentionally different from stable releases, so normal stable dependency resolution does not automatically promote this canary.
- Switching the production tree would require updating the complete related package family together, then running application checks with that alpha tree. We have only verified its published metadata, not its application runtime behavior.
- The npm dry-run did not propose these alpha versions and made no changes. Manually introducing them would be a separate prerelease adoption decision, not applying an npm-generated stable fix.

Therefore **no safe stable npm-recommended remediation is available from the inspected registry versions**. Keep the stable 8.72.2 family and record the seven moderate findings until a stable TypeScript-ESLint release declares minimatch >=11.0.1.

## 4. Automated Windows CI and results

Workflow: `.github/workflows/windows-ci.yml`.

- Triggers on pull requests targeting `main` and pushes to `feat/storefront-foundation`.
- Uses `windows-latest` and Node.js 24.
- Application job runs, in order: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Separate audit job preserves the full `npm audit --json` output and exact exit code as `npm-audit-report`.
- A separate dry-run investigation job preserves the complete dry-run stdout, stderr, exit code and the per-package registry metadata as `npm-audit-fix-dry-run`.

Run #10 results for branch head `86746a9fc3ddb64faee551fefd256ba9504f3785`:

| Job | Result |
|---|---|
| Windows application verification | **success** — npm ci, typecheck, lint, tests, build all passed |
| Windows dependency audit | **failure, expected** — 7 moderate vulnerabilities; JSON artifact uploaded |
| Windows npm audit fix dry-run investigation | Dry-run command exited 1 with no proposed package changes; full artifact uploaded; registry metadata step succeeded |

The audit job's failure is intentionally separate from application verification. It does not negate the successful typecheck/lint/test/build job, but the branch remains exposed to the advisory.

## 5. Next safe remediation procedure

When a stable TypeScript-ESLint package family release is available whose `typescript-estree` dependency accepts `minimatch >=11.0.1`:

1. Inspect the published stable metadata for the entire coordinated package family.
2. Update only through a supported stable family release; do not independently pin internal TypeScript-ESLint packages to mismatched versions.
3. Regenerate `package-lock.json` using npm and inspect the dependency diff.
4. Run `npm ci`, `npm explain minimatch`, and `npm ls minimatch --all`.
5. Confirm no affected minimatch 7.x–10.x copies remain.
6. Run `npm audit` and inspect the full JSON output.
7. Run typecheck, lint, all tests, and production build on Windows.
8. Commit the package manifest/lockfile and verification report to `feat/storefront-foundation` only.

Until a stable fix is published, keep the seven moderate audit entries visible and tracked. Do not suppress the audit, add an allowlist, use `--force`, add an incompatible override, or claim zero vulnerabilities.

## Next.js TypeScript checker setting

The repository's `next.config.ts` sets `experimental.useTypeScriptCli` to false. This is an actual Next.js 16 experimental configuration flag, not an invented setting. Next.js issue #96620 documents the stale `.next/dev/types` route-validator failure in the TypeScript CLI path and explains why the TypeScript API checker filters those development type files. Keeping false selects that API checker and is a targeted workaround; it does not disable strict TypeScript checking or ignore build errors. Preserve the setting unless a verified Next.js release fixes the CLI path and Windows verification demonstrates the change is safe.

## Sources

- GitHub advisory: https://github.com/advisories/GHSA-g3hv-75wg-m249
- npm `typescript-eslint` versions and dist-tags: https://www.npmjs.com/package/typescript-eslint?activeTab=versions
- Upstream TypeScript-ESTree package manifest: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-estree/package.json
- Next.js issue on stale dev route types and TypeScript CLI: https://github.com/vercel/next.js/issues/96620
