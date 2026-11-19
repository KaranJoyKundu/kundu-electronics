# Current security status — 19 November 2026

This is the current status for the `main` production baseline and the production-readiness hardening branch. Older investigations remain below as dated history.

## Dependency audit

The latest verified complete Windows audit from the prior release reported:

| Severity | Findings |
|---|---:|
| Critical | 0 |
| High | 14 |
| Moderate | 0 |
| Low | 0 |
| Total | 14 |

All 14 affected lockfile nodes were classified as development-only tooling. The dependency chain includes `picomatch@4.0.7` via build/lint tooling; the GitHub advisory is [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf). The checked npm registry still reported 4.0.7 as the current version on 19 November 2026; no safe stable patched release was available in the evidence inspected for this update.

The earlier `npm audit fix --dry-run` exited non-zero and produced no safe resolution. Do not use `npm audit fix --force`, incompatible overrides, arbitrary Git dependencies or a major-version downgrade to make the report green.

The hardening workflow now:
- Keeps the full `npm audit --json` report visible and verifies remaining findings are development-only.
- Runs a separate `npm audit --omit=dev --json` job that fails if any production dependency advisory remains.
- Uploads audit evidence.
- Uses Node 24-compatible GitHub Actions pinned to immutable commit SHAs.

**Current production-only audit result is pending the hardening PR's CI run.** A clean production-only audit does not mean the full development dependency tree has zero known findings.

## Supabase database security review

Read-only project inspection on 19 November 2026 confirmed RLS enabled on all 21 public tables. The new migration `20261119094342_security_and_fk_index_hardening` was applied to the live project and:

- Added indexes for 11 previously unindexed foreign-key columns.
- Revoked direct anon/authenticated execute on `has_store_role(admin_role[])`.
- Revoked anon execute on `is_store_admin()` and `is_store_staff()`, while keeping authenticated execute for RLS policies.
- Documented `rate_limit_windows` as private rate-limit state with no direct anon/authenticated policies or grants; only service_role can reach its rate-limit RPC.

Authorization review of live SECURITY DEFINER functions found the stock/order operations check `is_store_staff()`, payment verification checks `is_store_admin()`, and service-role-only functions are not executable by anon/authenticated. Public catalogue/count/config/category helper functions remain executable for their intended public read use and are constrained to published/public information.

Supabase still reports generic SECURITY DEFINER advisories for those intentional helpers and role-guarded authenticated RPCs, plus the expected no-policy warning on the private rate-limit table. Do not interpret the advisor count as a confirmed exploit without reviewing the function body and grants.

## Supabase Auth setting still requiring owner action

The live Auth advisor reports leaked-password protection disabled. Supabase's current [password security documentation](https://supabase.com/docs/guides/auth/password-security) says the HaveIBeenPwned-backed protection is available on Pro and above. This setting is not exposed by the connected Supabase database tools used here, so it was not toggled programmatically. The owner must enable it in Supabase Dashboard → Authentication → Settings / Password security, if the current plan includes it.

## HTTP hardening

The hardening branch adds:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- HSTS with a two-year max-age and subdomains

Verify the actual response headers after the production deployment. A restrictive CSP is deliberately not added until Next.js scripts and inline framework behavior have been validated under a nonce/hash CSP in a real browser.

## Release decision

Do not describe this project as vulnerability-free. Keep the full development audit warning visible until upstream publishes a safe fix and the Windows CI test proves it. The production-only audit must pass, RLS and role checks must remain tested, and Supabase leaked-password protection remains an owner-controlled Auth configuration item.


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
