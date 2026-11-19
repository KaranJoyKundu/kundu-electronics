# Production readiness remediation — 19 November 2026

## Release result

The repository-controlled production-readiness backlog was implemented in PR #11 and merged into `main`.

- Production commit: `655030e3900823c8f2ceaf2ce3083c19ceea058b`.
- Production Vercel deployment: `dpl_5yK3qWcQfNqLB3LqbMa93Ju1UaQb`, **READY**.
- Windows CI run: https://github.com/KaranJoyKundu/kundu-electronics/actions/runs/44500366096
- Full npm audit: 0 critical / 0 high / 0 moderate / 0 low.
- Production-only npm audit: 0 critical / 0 high / 0 moderate / 0 low.
- Windows application verification: clean install, typecheck, lint, 44 tests passed, production build.
- Production readiness PR: https://github.com/KaranJoyKundu/kundu-electronics/pull/11

## Implemented and live

| Area | Change | Verification |
|---|---|---|
| Project image integrity | Removed unverified remote robot photo hotlinks. LFR/Soccer/RC use approved local component photos with explicit “not a build photo” captions. Drone uses an original concept SVG labelled as concept art, not a completed build or verified kit. Bee retains owner case-study photos. | Production project pages return HTTP 200; no unverified third-party project-photo URLs remain. |
| Kit image fallback | Removed six remote kit photo URLs from the product image map. Project kit products use local artwork fallback until actual owner-approved kit photography exists. | Three kit detail product pages HTTP 200; original P001–P211 mapping preserved. |
| Search | Added a related Breadboard match for the single-letter `b` autocomplete search. | Live API returns P079 and P080 first for `b`; `breadboard` returns both products. |
| Search accessibility | Added keyboard navigation, Escape, Enter, active option semantics and visible active state. | Windows lint, typecheck and 44 tests pass. |
| Image optimization | Converted raw product/Bee images to Next Image; only the specific Bee case-study host/path was added to the remote allowlist. | Production optimized product and Bee image endpoints return HTTP 200 with image MIME types. |
| HTTP security | Added nosniff, frame denial, Referrer-Policy, Permissions-Policy and HSTS headers. | Canonical production response headers verified. |
| GitHub Actions | Pinned checkout/setup-node/upload-artifact actions by immutable SHA, added main push verification, a strict full dependency audit (fail on any finding), and a separate production-only audit. The write-enabled dependency-remediation workflow is restricted to trusted pushes on `feat/launch-prep`. | Windows CI run #188: all required jobs success. |
| Supabase permissions | Removed anon/authenticated execute from `has_store_role`; removed anon execute on role wrappers while retaining authenticated wrapper access needed by RLS. | Live permission query verified. |
| Supabase indexes | Added 11 missing FK indexes. | Live migration applied; unindexed FK advisor findings cleared. |
| Documentation | Reconciled product counts, checkout, branch, deployment and security status; added this implementation record. | Repository source review. |

## Verified live business/data state

- 220 product rows total: 208 published, 12 archived.
- 18 published categories: 199 published original SKU products plus nine published project kits.
- 49 published products have no confirmed selling price.
- Availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order, six unknown.
- Orders: 0; payment submissions: 0.
- Checkout is enabled for unpaid order requests.
- Standard delivery: 12 hours–1 day / ৳0. Urgent: 30–60 minutes / ৳50. Address/feasibility is confirmed by the shop.
- bKash and Nagad remain disabled; receiving numbers and instructions are unset.

## Current security posture

- RLS is enabled on all 21 public tables.
- `rate_limit_windows` intentionally has no anon/authenticated policies or grants; the service-role RPC alone accesses it.
- Role helper execute grants were narrowed; operational SECURITY DEFINER RPCs retain server-side staff/admin checks.
- Supabase Auth leaked-password protection remains disabled and requires an owner dashboard change if their plan supports it.
- Supabase advisors still report some generic SECURITY DEFINER notices for deliberate public/role-guarded helpers, multiple-permissive-policy notices and unused-index notices. No claim is made that every generic advisor notice is cleared.
- Current full and production npm audits report zero known advisories. The previous picomatch advisory GHSA-fc5q-39xc-vjpf was withdrawn by GitHub on 18 November 2026: https://github.com/advisories/GHSA-fc5q-39xc-vjpf.

## Remaining owner or browser tasks

1. Confirm the 49 missing customer-facing selling prices; no amounts were guessed.
2. Physically verify six unknown stock records and reconfirm stock status.
3. Owner must complete magic-link sign-in and verify protected admin pages in an actual browser.
4. Enable Supabase Auth leaked-password protection if the project's plan includes it.
5. Supply exact bKash/Nagad receiving information and approved instructions before enabling payments.
6. Approve any new delivery, warranty, policy or service claims.
7. Approve actual project build photos and image rights if adding them later.
8. Complete full interactive Playwright/manual visual testing at 1440×900, 1366×768, 768×1024, 390×844 and 360×800; run Lighthouse and WCAG 2.2 AA checks. The HTTP/SSR smoke tests recorded here do not substitute for those checks.

## Production smoke verification

The canonical site returned HTTP 200 for home, shop, projects, LFR, Soccer, RC, Drone, image credits, robots and sitemap. Search, price-filter, security-header and optimized image endpoints were tested on production. This is not a full interactive browser audit.
