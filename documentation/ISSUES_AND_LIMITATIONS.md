# ISSUES AND LIMITATIONS

## Blocking integration work

1. No Supabase project or local Postgres/Supabase runtime is connected. The migration, RLS, Storage policies and RPCs are draft code until applied and tested.
2. No `package-lock.json` exists in the assistant worktree. The owner's Windows `npm install` created 358 packages, but the generated lockfile has not been supplied. Without it, `npm ci` and accurate dependency auditing are not possible.
3. Owner reports seven moderate npm advisories, but the exact `npm audit --json` report is unavailable. Do not guess affected packages or force-upgrade.
4. Full Next typecheck, ESLint and production build could not be run in the assistant runtime because `node_modules` is absent. The new ESLint flat config is not yet executed after migration.
5. SQL/pgTAP tests and concurrency tests have not run. The security-contract file has 23 assertions but needs actual database execution and row/role fixtures.
6. No browser/Playwright screenshots or visual QA have been run after the expanded changes.
7. Local changes are committed as `c38f358`; GitHub push is pending because this runtime could not resolve `github.com`. Local `origin` is a Git bundle path, not the GitHub remote. Import the supplied bundle, fetch the actual GitHub remote and push without force after reviewing divergence.

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
