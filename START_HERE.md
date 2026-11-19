# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components storefront.
- Location/currency: Khulna, Bangladesh · BDT (৳).
- Design reference: https://www.sparkfun.com/ (inspiration only; retain Kundu Electronics branding and verified facts).
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private).
- Default and production branch: `main`.
- Production URL: https://kundu-electronics.vercel.app
- Latest verified production commit: `cf45e25cc1fcd0a956a57e412806bf80674677e2`.
- Latest Vercel production deployment: `dpl_FZLGsPFyPPeSbPgAJ6JizoSr9Kgi` (READY).
- Production-readiness PR #11, photo restoration PR #13 and checkout/payment PR #14 are merged: https://github.com/KaranJoyKundu/kundu-electronics/pull/14.

## Read first

1. `documentation/LAUNCH_STATUS.md` — current verified production and owner blockers.
2. `documentation/PROJECT_STATE.md` — architecture and current implementation.
3. `documentation/TASK_TRACKER.md` — open work.
4. `documentation/DEPENDENCY_SECURITY_REMEDIATION.md` — current dependency and Supabase security status.
5. `documentation/PRODUCT_DATA_IMPORT.md` — catalogue truth and publishing rules.
6. `documentation/PRODUCTION_READINESS_REMEDIATION.md` — fixes made and verification limits.
7. `documentation/DECISIONS.md` and `documentation/research/README.md`.

## Stack and commands

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- Supabase PostgreSQL, Auth and Storage.
- Vercel production deployment.
- Node.js 24 in Windows CI.

Run from a clean checkout:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
npm audit --omit=dev
```

## Verified live catalogue and business settings

- 208 published products across 18 published categories.
- 199 published original SKUs from P001–P211, plus nine published robot kits.
- 12 other original resistor-named rows are archived, not deleted.
- 49 published products have no verified selling price and must show “Price on request”.
- Availability: 117 in stock, 34 low stock, 42 out of stock, nine build-to-order kits and six unknown.
- No prices, stock quantities, specifications, warranties or policies may be guessed.
- The static photo archive maps the 211 original SKU images. The owner confirmed permission/licensing for the supplied image set; Creative Commons image sources remain credited at `/image-credits`.
- Bee Biped uses owner project photographs. LFR/Soccer/RC artwork uses approved component photos and is not presented as completed build photography. Drone is a concept illustration until an owner-approved build photo/BOM exists.

## Orders and payments

- Supabase `checkout_enabled=true`: the site accepts unpaid order requests with server-authoritative totals and stock confirmation.
- Current database count: zero orders, zero payment submissions.
- Delivery choices configured: Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50). The shop confirms the address and feasibility.
- bKash and Nagad are enabled in Supabase and both use the owner-provided receiving number `01735530174`.
- Checkout offers Cash on delivery and Online payment. Online payment shows the exact order total, asks for sender number and TrxID, and keeps the submission pending until an authorized admin verifies it.
- Orders requiring manual stock confirmation must not be paid until stock and the final amount are confirmed. The checkout flow only shows the TrxID form when the order is `awaiting_payment`.
- Reference and suggestions/feedback are saved in the order note. COD preference is retained and does not ask for a transaction ID.
- Keep sufficient balance for any applicable Send Money/service charge shown by the wallet app; never deduct that fee from the order amount.

## Security and release status

- Supabase RLS is enabled on the 21 public tables. `rate_limit_windows` intentionally has no client policies/grants; the service-role-only rate-limit RPC accesses it.
- Security-definer staff/admin operations are directly callable by authenticated users only where needed and enforce staff/admin role checks inside each function.
- Anonymous execution of direct role-introspection helpers was revoked; public read-only catalogue/config RPCs remain available by design.
- Supabase Auth leaked-password protection is disabled. The project owner must enable it in Auth settings if the plan supports it (Supabase docs say Pro and above).
- Windows CI run #188 passed typecheck, lint, 44 tests and production build. Both full `npm audit` and production-only `npm audit --omit=dev` report zero known vulnerabilities. The Windows workflow now fails on any future advisory.
- The earlier picomatch GHSA-fc5q-39xc-vjpf advisory was withdrawn by GitHub on 18 November 2026: https://github.com/advisories/GHSA-fc5q-39xc-vjpf.
- Never expose `SUPABASE_SECRET_KEY` or `APP_HMAC_SECRET`; keep them server-only in Vercel.

## Owner-controlled blockers

Do not fabricate or silently enable these:
- 49 unconfirmed customer-facing selling prices.
- Six unknown stock quantities and physical stock revalidation.
- Re-confirm the receiving number before future payment-setting changes; current configured number is `01735530174`.
- Admin magic-link sign-in confirmation.
- Supabase Auth leaked-password protection, subject to plan and dashboard permissions.
- Any delivery/policy/warranty statement not explicitly approved by the owner.
- Rights/permission for any future third-party build photography.

## Data protection

- Public product records contain customer-facing selling prices only.
- Never publish purchase prices, margins, supplier identities, private stock notes or source workbooks.
- Do not commit credentials, `.env.local`, owner documents or raw inventory workbooks.
- Preserve order history; archive instead of deleting business records.
