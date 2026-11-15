# ISSUES AND LIMITATIONS

**Last reviewed:** 15 November 2026

This file describes the current feature-branch state. Code existing in the repository is not proof that a live integration has been configured or tested.

## Production blockers

1. **Supabase is not verified.** No connected staging or production project is documented. The application has no confirmed live URL, publishable key or server secret.
2. **The migration is unapplied.** supabase/migrations/0001_initial_schema.sql is present but has not been applied to a verified database. Review and test it before production use.
3. **RLS and Storage need real tests.** supabase/tests/security_contract.test.sql contains 23 pgTAP assertions. The test file has not been run against the current migration in a disposable database. Role-specific and signed-image access tests remain necessary.
4. **The public catalogue is empty.** src/data/catalogue.ts intentionally exports empty product/category arrays. The database-backed catalogue also needs approved rows. Candidate product information is not publication approval.
5. **Product records need owner approval.** The import notes describe 74 preliminary component/kit candidates; 8 price cases require clarification. Verify current prices, stock, descriptions, product identifiers and image provenance before publishing.
6. **Delivery is not configured.** No enabled delivery zones, exact charges or approved delivery policy are present.
7. **Manual payment is disabled.** bKash/Nagad receiving numbers and customer instructions are null/disabled. There is no automatic gateway verification. Submitted references stay pending until human verification.
8. **Admin integration is unverified.** Login and protected admin pages are implemented, but a real Auth user, admin role and role boundaries have not been verified against Supabase.
9. **End-to-end testing is outstanding.** Checkout concurrency, stock reservation, idempotency, order access tokens, payment submission, staff verification and customer/role isolation need staging checks.
10. **Production hosting is not confirmed.** No validated deployment, environment setup, domain or HTTPS smoke test was established during this review.

## Build and dependency verification

- package-lock.json exists on feat/storefront-foundation. Use npm ci for a reproducible install.
- A prior assistant-runtime unit-test run reported 42 passed, 0 failed. Rerun on the current Windows clone.
- Full current typecheck, lint and production build have not been verified on the owner’s Node 24 environment after the latest changes.
- The previous supplied dependency report listed seven moderate indirect TypeScript-ESLint/minimatch findings. That report is historical, not a fresh audit of the current lockfile. Run npm audit and inspect npm audit fix --dry-run before deciding whether to update packages.
- Never use npm audit fix --force or force a major transitive dependency override without confirming compatibility.

## UX and business-content gaps

- The shipping/returns page explicitly says delivery charges, timelines and return conditions are not configured. Replace this with owner-approved policy text before accepting orders.
- Opening hours are not configured. The contact page tells visitors to contact the shop before visiting.
- Product photos must be matched to the correct product and approved for use. A product image does not prove availability, specifications or price.
- The site must not advertise delivery areas, fees, time promises, warranty or returns until the owner confirms them.

## Architecture constraints

- Product variants share product-level inventory. Distinct per-variant stock is not implemented.
- Payment is manual only. No bKash/Nagad gateway or automatic transaction-verification API is implemented.
- Product images use a private Storage bucket and signed URLs; verify published-user reads and staff draft previews in the target Supabase project.
- The rate limiter relies on APP_HMAC_SECRET and service-side database functions. Production must be tested behind the actual hosting provider’s request/IP forwarding behaviour.
- The single initial migration is large. Validate it in staging first; once it has been applied to a real environment, use new forward migrations rather than editing its historical contents.

## Security rules

- SUPABASE_SECRET_KEY and APP_HMAC_SECRET must remain server-only.
- Never put private values in NEXT_PUBLIC_ variables, client components or committed files.
- Do not enable checkout without an approved payment method and at least one enabled delivery zone with a known charge.
- Never label a customer-submitted payment reference as paid. Only an authorized administrator may verify a transfer.
- Do not log or expose customer addresses, credentials or full transaction references.

## Launch fallback

A catalogue/contact launch is acceptable while checkout remains disabled, provided all displayed products and business details are verified. A transactional launch is not acceptable until the migration, RLS, storage, admin, delivery, payment and order lifecycle gates pass.
