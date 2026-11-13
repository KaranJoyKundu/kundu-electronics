# IMPLEMENTATION_PLAN — approved delivery sequence

## Phase 0 — repository and dependency integrity (P0)

- Verify correct GitHub account, private repository, branch heads and local working tree.
- Preserve existing uncommitted Windows changes; fetch/compare before commit or push.
- Obtain committed lockfile and `npm audit --json`; migrate and verify ESLint 9 flat config, Turbopack root and scroll behavior.
- Acceptance: no lost work; `npm ci`, typecheck, ESLint, test and production build pass on the same tree; vulnerabilities triaged with compatible fixes only.

## Phase 1 — business data intake (P1)

- Review product candidate import files and original source documents.
- Confirm SKU/model, category, one selling price, product options, actual availability, specifications and images.
- Keep ambiguous price alternatives/ranges and estimates in review state.
- Acceptance: import report has provenance and validation; all rows default draft; cost/supplier fields are removed before any public serialization; owner approves exact published set.

## Phase 2 — PostgreSQL schema and security validation (P1)

- Review `supabase/migrations/0001_initial_schema.sql` against owner requirements.
- Execute on disposable Supabase local stack; fix SQL syntax, constraints, FK, policy and grant errors.
- Run 23 pgTAP checks, then add fixture tests for anon/customer/staff/admin and Storage paths.
- Add concurrency tests for checkout idempotency, price changes, variants, stock reservation, cancellation and payment verification.
- Acceptance: migration repeatability/reset documented; RLS verified using actual role JWTs; no privileged RPC granted to browser roles.

## Phase 3 — Supabase configuration and authentication (P1)

- Owner creates Supabase project and enters public URL/publishable key, server-only secret and HMAC secret in local/deployment environment.
- Verify Auth OTP sign-in, cookie refresh via Next 16 `proxy.ts`, admin role assignment via controlled out-of-band procedure and staff/admin permission boundaries.
- Acceptance: no public registration or self-promotion; secret key absent from client bundle; admin pages reject anonymous/customer sessions.

## Phase 4 — catalogue and administration (P1)

- Add and edit categories, products, SKUs, descriptions, selling prices, variant options, specifications and images.
- Preserve draft/review/published lifecycle and private inventory record separation.
- Add admin dashboard, stock tracking mode and audited movement tools.
- Acceptance: public views expose only published categories/products/active variants/signed images; unknown stock is not rendered as zero or guaranteed availability.

## Phase 5 — customer catalogue and shopping (P1)

- Complete database-side search, one-character queries, category and inclusive price filters, sort and bounded pagination.
- Complete product option selection, image gallery and cart persistence.
- Cart displays current server catalogue price; checkout never trusts the browser total.
- Acceptance: no full catalogue download for autocomplete/cart; filters combine; invalid/discontinued variants block purchase.

## Phase 6 — order and manual payment lifecycle (P1)

- Verify atomic server-side checkout and order/item snapshots.
- Configure delivery zones/charges only after owner confirmation; configure bKash/Nagad only after approved receiving numbers/instructions.
- Accept sender number and transaction reference; keep pending until authorized staff verify or reject with reason.
- Acceptance: duplicate submits idempotent; simultaneous checkout cannot oversell tracked stock; audit shows actor/time; payment and fulfilment remain separate.

## Phase 7 — content and policy pages (P2)

- Populate contact and public business content from verified details only.
- Add owner-approved delivery, returns, warranty and operating-hour policies; until then use clearly labeled non-promissory states.
- Acceptance: no unsupported business claims or dead navigation routes.

## Phase 8 — quality, CI and deployment (P1/P2)

- Playwright tests at 1440×900, 1366×768, 768×1024 and 390×844; keyboard/accessibility pass.
- CI uses committed lockfile for `npm ci`, typecheck, lint, unit tests and build; DB test job uses ephemeral/local database as appropriate.
- Dependabot updates are reviewable PRs; deploy a private preview only after secrets/data policies configured.
- Acceptance: all important flows pass; production deployment does not expose unconfigured payment or fake product data.
