# Launch status — 18 November 2026

## Verified live catalogue

- Production storefront: **https://kundu-electronics.vercel.app**
- Vercel production deployment: `dpl_6tSReMPjewAkPAwSQCo46vTD4R9x`, state **READY**.
- The deployment source is `feat/launch-prep`, commit `900d331f396027becca4e95fcdd8b91683a55087`. The canonical Vercel alias points to this deployment. The `main` branch remains unchanged.
- Live Supabase project: `tcapxmiroikbsozvucmt`, region `ap-northeast-1`.
- The exact public catalogue count function returns **211 products**. There are **17 published categories** and **211 inventory records**.
- The shop presents all 211 published products using 24 items per page (**9 pages**) with server-side search, category and BDT price filters.
- The public photo gallery renders all 211 products, not a curated subset. Each SKU P001–P211 maps to its corresponding image tile in `public/product-previews/kundu-catalogue-sprite.webp` (46,362 bytes, 16 columns × 14 rows).
- The owner confirmed on 18 November 2026 that Kundu Electronics has permission/licensing to use all 211 photographs supplied in the image package. The 19 Creative Commons source photographs have author/source/licence details listed at `/image-credits`; the owner-supplied set is also identified there.
- Product images are static catalogue assets. The Supabase `product_images` table currently has zero rows; the complete static sprite is the image source used by the storefront.

## Price and availability transparency

The imported inventory is represented as recorded; missing values were not guessed:

- **49 products** have no confirmed customer selling price and show **“Price on request”**.
- Availability from the supplied workbook: **129 in stock**, **34 low stock**, **42 out of stock**.
- **6 products** have no recorded stock quantity and show **“Availability to confirm”**.
- Customer-facing inventory counts, buying prices, margins, supplier identities and private notes are not exposed.
- These values should still be physically reconfirmed by the owner before accepting paid orders or advertising availability.

## Website order requests and payment separation

- Supabase checkout_enabled = true.
- Two enabled delivery choices: Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50). The shop confirms address/feasibility.
- The website order API and database create unpaid order requests using server-authoritative current prices, idempotency, quantity bounds and stock locks.
- Orders containing untracked build-to-order items begin in pending_stock_confirmation. The shop must confirm stock and delivery before arranging payment.
- No online payment is collected. There are currently zero enabled payment methods, so bKash/Nagad receiving details and payment instructions are not shown. New orders have payment status not_submitted.
- WhatsApp handoff includes each product’s SKU, name, price × quantity, line total, delivery charge and final Total: line. Click-to-call is available as an alternative.
- A single admin profile exists; the owner still needs to sign in and verify protected admin pages in a browser.
- Vercel has public Supabase URL/publishable-key variables and protected server-only entries for SUPABASE_SECRET_KEY and APP_HMAC_SECRET. Secret values are not present in source control or this document.

## CI and security

- Windows application verification has passed: clean install, typecheck, lint, tests and production build.
- The Windows workflow's “Verify or assemble the complete 211-product photo sprite” step passed.
- Stable TypeScript-ESLint `8.73.0` and nested `minimatch@11.0.9` are committed on the feature branch.
- The remaining dependency audit reports **14 high, 0 moderate and 0 critical** findings in development-only tooling. The outstanding high advisory is GHSA-fc5q-39xc-vjpf in `picomatch <=4.0.7`. The project is **not described as security-clean**; see `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.
- Supabase security-advisor warnings still need review. RLS is enabled on all 21 public tables; two Storage buckets are private.

## GitHub review state

- The live production deployment remains on `feat/launch-prep`; this follow-up is isolated on `feat/founder-projects-storefront-orders`.
- Follow-up PR #4: https://github.com/KaranJoyKundu/kundu-electronics/pull/4 — targets `feat/launch-prep`, not `main`, and remains open/unmerged.
- Separate draft PR #3 to `main` remains unchanged and unmerged.
- Latest follow-up commit: `2a10d885381ea3b9c351cf8df1d7ce5dd7d78def`; Vercel preview deployment from that commit is READY at `https://kundu-electronics-hv1bft3mf-kundu2409056-5098.vercel.app`.

## Verification still required by the owner

1. Open https://kundu-electronics.vercel.app on desktop and mobile. Check the home page, all 9 shop pages, search, category/price filters, each product photo, product detail pages and WhatsApp enquiry-cart flow.
2. Sign in at `/admin/login` and confirm the protected admin pages work.
3. Reconfirm the selling prices and physical stock. In particular, fill the 49 missing prices and six unrecorded stock quantities if they are now known.
4. Confirm that Standard and Urgent delivery windows are feasible for each order address before dispatch.
5. Supply verified bKash/Nagad receiving numbers and payment instructions before enabling online transfer. Until then, arrange payment directly after the shop confirms the order.

The public catalogue and project kits are published. Website order requests can be recorded without online payment; paid mobile-transfer submissions remain disabled until verified business receiving details and customer instructions are configured.
