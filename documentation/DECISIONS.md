# DECISIONS

## D-001 — Create a replacement project if no existing Kundu repository can be recovered

- **Date:** 2026-11-13
- **Context:** Connected GitHub search and current uploads did not expose the prior Kundu Electronics source project; owner explicitly authorized a new project.
- **Decision:** Initialize a local `kundu-electronics` project and Git repository; preserve the ability to compare/merge the original later.
- **Reason:** Keep implementation moving without claiming access to or overwriting an unknown original.
- **Alternatives:** Wait for original ZIP; use an unrelated public repository (rejected).
- **Consequences:** Local work exists; GitHub remote still needs creation because connector lacks that operation.

## D-002 — Use Next.js App Router, React, TypeScript and Tailwind CSS 4

- **Date:** 2026-11-13
- **Context:** The store needs SEO-friendly product/category pages, server-side order validation, responsive interactive UI and maintainable routing.
- **Decision:** Next.js 16.4.6 with React 19.3.0, strict TypeScript and Tailwind CSS 4.3.3.
- **Reason:** Next.js App Router supports server/client components and route handlers; React 19.3 is stable; Tailwind 4 integrates through its PostCSS plugin. Version choice avoids canary builds and uses the 16.4.6 stable/LTS release rather than pre-release 16.5 canary.
- **Alternatives:** Vite SPA (less suitable for server-side order handling/SEO routing); custom backend from scratch (more maintenance); pure static site (not enough for orders/admin).
- **Consequences:** Node 20.9+ required; Node 22 LTS recommended. npm dependencies must be installed in a network-enabled environment. Sources: https://nextjs.org/docs/app/getting-started/installation, https://react.dev/versions, https://github.com/vercel/next.js/releases.

## D-003 — Plan Supabase Postgres and Auth for production data and orders

- **Date:** 2026-11-13
- **Context:** Orders must persist and be protected; manual payment verification needs restricted staff access.
- **Decision:** Use Supabase Postgres, Supabase Auth and server-only privileged operations once owner creates the project and config is available.
- **Reason:** Managed PostgreSQL and session support fit the data model; Supabase's current Next.js docs support App Router with `@supabase/ssr`.
- **Alternatives:** LocalStorage-only orders (rejected; no reliable protected persistence); own server/database (more operational burden); spreadsheet-only order flow (not reliable for checkout).
- **Consequences:** Migration is proposed but not applied. Supabase project and secrets are still required. Source: https://supabase.com/docs/guides/auth/quickstarts/nextjs.

## D-004 — Keep catalogue empty until owner-approved data is received

- **Date:** 2026-11-13
- **Context:** Existing business product/inventory source is not attached; the earlier business notes mention buying prices may be included.
- **Decision:** Export zero published products initially; public Product type contains selling price only and excludes buying cost.
- **Reason:** Avoid fabricated stock/pricing and prevent accidental disclosure of purchase cost.
- **Alternatives:** Create example products for the live shop (rejected); guess stock (rejected).
- **Consequences:** Search/filter implementation can be developed and fixture-tested but live results remain empty until import.

## D-005 — Manual payment is not payment verification

- **Date:** 2026-11-13
- **Context:** Checkout uses bKash/Nagad Send Money and transaction references.
- **Decision:** A submitted reference creates an order with payment status `pending_verification`; only authorized manual action can mark payment verified.
- **Reason:** Reference text is customer-submitted and is not confirmation from bKash/Nagad.
- **Alternatives:** Auto-mark paid after reference input (rejected); imply gateway API integration (rejected).
- **Consequences:** Need protected admin workflow and confirmed receiving numbers before activation.

## D-006 — Provisional Kundu visual tokens, not claims about SparkFun's exact CSS

- **Date:** 2026-11-13
- **Context:** Research contains text/IA observations but zero screenshots or measured CSS values.
- **Decision:** Use a provisional warm-neutral / deep-forest / terracotta Kundu design system and reference SparkFun's structural patterns.
- **Reason:** Avoid fabricated exact color/font/dimension claims or direct copying of third-party assets.
- **Alternatives:** Claim unmeasured SparkFun hex values (rejected); embed SparkFun assets (rejected without permission).
- **Consequences:** Refine tokens after browser screenshot comparison and owner logo/branding assets are available.

## D-007 — Local Git branches until private remote creation is possible

- **Date:** 2026-11-13
- **Context:** GitHub tools have no repository-create operation.
- **Decision:** Keep local `main` as baseline and implement on `feat/storefront-foundation`; do not claim remote creation or push.
- **Reason:** Preserve history and keep main stable without fabricating GitHub completion.
- **Alternatives:** Create public repository (not possible); push to unrelated repo (rejected).
- **Consequences:** Owner must create private `kundu-electronics` remote or grant a connector that can create repositories.
