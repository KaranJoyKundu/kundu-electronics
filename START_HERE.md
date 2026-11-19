# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components storefront.
- Location/currency: Khulna, Bangladesh · BDT (৳).
- Design reference: https://www.sparkfun.com/ (inspiration only; retain Kundu Electronics branding and verified facts).
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private).
- Default and production branch: `main`.
- Production URL: https://kundu-electronics.vercel.app
- Latest verified production baseline before the current hardening PR: `528844c918aaa5a75fdfc83550ac8cd68922b8ba`.
- Active hardening branch: `chore/production-readiness-hardening`. Do not force-push or bypass its checks.

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
- bKash and Nagad are disabled; receiving numbers and customer instructions are unset.
- A submitted transaction reference is not proof of payment. Never mark an order paid without manual verification.

## Security and release status

- Supabase RLS is enabled on the 21 public tables. `rate_limit_windows` intentionally has no client policies/grants; the service-role-only rate-limit RPC accesses it.
- Security-definer staff/admin operations are directly callable by authenticated users only where needed and enforce staff/admin role checks inside each function.
- Anonymous execution of direct role-introspection helpers was revoked; public read-only catalogue/config RPCs remain available by design.
- Supabase Auth leaked-password protection is disabled. The project owner must enable it in Auth settings if the plan supports it (Supabase docs say Pro and above).
- Full `npm audit` last reported 14 high development-tooling advisories, zero moderate/low/critical. Do not describe the full dependency tree as clean. The Windows workflow runs a distinct production-only audit.
- Never expose `SUPABASE_SECRET_KEY` or `APP_HMAC_SECRET`; keep them server-only in Vercel.

## Owner-controlled blockers

Do not fabricate or silently enable these:
- 49 unconfirmed customer-facing selling prices.
- Six unknown stock quantities and physical stock revalidation.
- Payment receiving details/instructions for bKash or Nagad.
- Admin magic-link sign-in confirmation.
- Supabase Auth leaked-password protection, subject to plan and dashboard permissions.
- Any delivery/policy/warranty statement not explicitly approved by the owner.
- Rights/permission for any future third-party build photography.

## Data protection

- Public product records contain customer-facing selling prices only.
- Never publish purchase prices, margins, supplier identities, private stock notes or source workbooks.
- Do not commit credentials, `.env.local`, owner documents or raw inventory workbooks.
- Preserve order history; archive instead of deleting business records.
