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

## Enquiry-only safeguards

- Supabase `checkout_enabled = false`.
- No delivery zones/charges or enabled payment methods are configured; bKash/Nagad receiving details and payment instructions are not enabled.
- Customers can browse the complete catalogue and add items to the enquiry cart or message the shop on WhatsApp. The site does not simulate an order or payment.
- The checkout API/database guards prevent order creation while the prerequisites remain disabled.
- A single `admin` profile exists. The owner still needs to sign in and verify protected admin pages in a browser before using the portal operationally.
- Vercel has public Supabase URL/publishable-key variables and protected server-only entries for `SUPABASE_SECRET_KEY` and `APP_HMAC_SECRET`. Secret values are not present in source control or this document.

## CI and security

- Windows application verification has passed: clean install, typecheck, lint, tests and production build.
- The Windows workflow's “Verify or assemble the complete 211-product photo sprite” step passed.
- Stable TypeScript-ESLint `8.73.0` and nested `minimatch@11.0.9` are committed on the feature branch.
- The remaining dependency audit reports **14 high, 0 moderate and 0 critical** findings in development-only tooling. The outstanding high advisory is GHSA-fc5q-39xc-vjpf in `picomatch <=4.0.7`. The project is **not described as security-clean**; see `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`.
- Supabase security-advisor warnings still need review. RLS is enabled on all 21 public tables; two Storage buckets are private.

## GitHub review state

- Launch work remains isolated on `feat/launch-prep`.
- Draft PR #3: https://github.com/KaranJoyKundu/kundu-electronics/pull/3
- PR #3 is open and unmerged. Do not merge it into `main` until owner visual checks and remaining security/configuration reviews are complete.

## Verification still required by the owner

1. Open https://kundu-electronics.vercel.app on desktop and mobile. Check the home page, all 9 shop pages, search, category/price filters, each product photo, product detail pages and WhatsApp enquiry-cart flow.
2. Sign in at `/admin/login` and confirm the protected admin pages work.
3. Reconfirm the selling prices and physical stock. In particular, fill the 49 missing prices and six unrecorded stock quantities if they are now known.
4. Approve delivery areas, delivery charges and customer-facing policy.
5. Configure bKash/Nagad receiving details and instructions only after confirming the exact business details.
6. Keep checkout disabled until the server-only secrets, payment/delivery settings, order creation and payment verification have been tested end-to-end.

The complete 211-product photo catalogue is deployed in **enquiry-only mode**. Paid ordering remains intentionally disabled until the owner completes the checks above.
