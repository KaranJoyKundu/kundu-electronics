# Production readiness remediation — 19 November 2026

This report records changes made from the autonomous audit backlog. It distinguishes changes already applied to live Supabase from source changes awaiting CI/merge/deployment.

## Implemented in the hardening branch

| Area | Change | Verification |
|---|---|---|
| Project image integrity | Removed unverified Daraz/Hackster/Instructables/MakerWorks hotlinks for LFR, Soccer Bot, RC and Drone project art. LFR/Soccer/RC now use the shop's approved local component photos with explicit “not a build photo” captions. Drone uses an original concept SVG and states that no verified BOM/build photo is available. Bee keeps owner case-study photos. | Source inspection; production visual verification still pending. |
| Kit catalogue cards | Removed remote project-kit image URLs from the SKU map. Kits now use the existing local component artwork fallback until an owner-approved kit photo exists. | Source inspection; branch CI pending. |
| Search | Added one-character "b" related expansion to "breadboard", returning real Breadboard product rows before broad matches. Added tests for the expansion helper. | Unit tests included in npm test; CI pending. |
| Search accessibility | Added ArrowUp/ArrowDown navigation, Enter selection, Escape handling, aria-activedescendant, aria-selected and a visible active option state. | Build/lint and manual browser test pending. |
| HTTP security | Added nosniff, frame denial, Referrer-Policy, Permissions-Policy and HSTS headers in Next.js config. | Must confirm deployed response headers after release. A restrictive CSP is intentionally deferred until real-browser nonce/script compatibility is tested. |
| GitHub Actions | Updated checkout/setup-node/upload-artifact to immutable Node 24 action revisions; added main push verification; added a production-only npm audit --omit=dev gate; prevented the write-enabled dependency-remediation job from running on untrusted pull_request events. | CI pending on the hardening PR. |
| Documentation | Updated README, START_HERE, PROJECT_STATE, LAUNCH_STATUS and PRODUCT_DATA_IMPORT to match live Supabase counts and current branch/deployment state. | Source review. |
| Supabase permissions | Removed anon/authenticated execute on has_store_role; removed anon execute on is_store_admin and is_store_staff, retaining authenticated access needed by RLS. | Applied and verified on live database. |
| Supabase indexing | Added 11 missing FK indexes identified by the live performance advisor. | Applied; unindexed-FK advisor findings no longer appear. |

## Live database facts verified

- 220 product rows total: 208 published and 12 archived.
- 18 published categories.
- 199 published original SKU rows plus nine published kit rows.
- 49 published products without confirmed selling prices.
- Availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order and six unknown.
- Orders: 0. Payment submissions: 0.
- Checkout enabled for unpaid order requests.
- Standard delivery: 12 hours–1 day / ৳0. Urgent: 30–60 minutes / ৳50.
- bKash/Nagad disabled; no receiving numbers or instructions configured.

## Supabase security-advisor interpretation

The live advisor still reports:

- Four anon-executable SECURITY DEFINER functions: public product search/count, public checkout configuration and published-category checks. These functions intentionally provide public read-only results; grants were checked and role introspection is no longer anon-callable.
- Fourteen authenticated-executable SECURITY DEFINER functions. Stock/order functions check staff, payment verification checks admin, and the public helper functions expose only safe read data. Service-role-only checkout/guest-order/rate-limit functions remain inaccessible to anon/authenticated.
- rate_limit_windows has RLS enabled and no policies. This is intentional: it has no direct client grants and is accessed by a service-role-only RPC.
- Multiple permissive policy and unused-index advisories remain. The 11 new FK indexes may be reported as unused until workloads exercise them; do not delete them solely because a fresh advisor snapshot sees no reads.
- Leaked-password protection remains disabled in Supabase Auth.

This is not a zero-advisory state and is not described as such.

## Work still blocked or not safely inferable

1. **Dependency advisory:** previous complete audit reported 14 high development-tooling findings, all dev-only, through picomatch 4.0.7. No safe patched stable release was found in the checked registry. The full audit must remain visible; do not force an incompatible override. The production-only CI audit must still pass.
2. **Supabase leaked-password protection:** the Auth advisor says disabled. Supabase's current documentation says this HaveIBeenPwned-backed option is Pro and above. An owner with the appropriate plan must enable it in Supabase Dashboard → Authentication → Settings / Password security. This connector can inspect the database but cannot change that Auth setting.
3. **Business data:** 49 selling prices and six availability states need owner confirmation. No values were guessed.
4. **Payment activation:** bKash/Nagad remain disabled until verified receiving numbers and owner-approved instructions exist.
5. **Admin sign-in:** an owner must open the email magic link and confirm the protected admin session. No authentication bypass was attempted.
6. **Visual testing:** HTTP/SSR smoke checks are not a full browser audit. Real Playwright/Lighthouse desktop, tablet and mobile testing still needs to run in an environment with browser automation.
7. **Image rights:** future external project photos must have documented permission/licence. Existing project collages use the owner-approved local component-photo set; the drone illustration is not a photograph.

## Release acceptance

Do not merge/deploy until Windows CI passes typecheck, lint, tests, production build and the production-only dependency audit. After deployment, verify the exact Vercel source SHA, READY status, headers, all major pages, images, search (b and breadboard), pagination, ৳0–৳200 filtering and responsive customer journeys. Do not create real production orders or payments for testing.
