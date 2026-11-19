# Product and inventory data intake

## Current live catalogue — verified 19 November 2026

The live Supabase database contains **220 product rows**:

- **208 published products** across **18 published categories**.
- **199 published original inventory SKUs** from the P001–P211 range.
- **Nine published build-to-order robot kits**: LFR-T1–T3, SB-T1–T3 and RC-T1–T3.
- **12 original resistor-named rows are archived**, not deleted. P091 remains published.
- The catalogue count API returns the published rows, not the number of original source SKUs.

Published customer-facing state:

| Field | Live count |
| --- | ---: |
| Published products with no confirmed selling price | 49 |
| In stock | 117 |
| Low stock | 34 |
| Out of stock | 42 |
| Build to order | 9 |
| Availability unknown | 6 |

The 49 missing prices remain null and must appear as “Price on request”. The six unknown availability values must stay unknown. No prices or stock values have been invented.

## Original product images

- The repository retains original SKU photo assets for P001–P211.
- The owner confirmed permission/licensing for the supplied image set on 18 November 2026.
- The static mapping is in `src/lib/product-image-paths.ts`; the optimized catalogue sprite is `public/product-previews/kundu-catalogue-sprite.webp`.
- The image credits page lists the owner-provided and open-licensed source images.
- Project showcase collages use those matching approved component photos, not unrelated third-party images of other people's builds.
- Bee Biped uses owner project photographs from its case study. Drone uses a clearly labelled concept illustration because there is no verified drone BOM or owner-approved build photo.

## Data privacy and import boundaries

Only customer-facing information may be stored in public catalogue fields. Never publish or commit:
- Purchase/buying prices, profit margins or markup calculations.
- Supplier identities, supplier contacts or private sourcing notes.
- Private stock notes, reorder details, stock valuation or cash-flow data.
- The raw master workbook, private business documents, credentials or environment files.

## Required owner follow-up

- Confirm the 49 missing customer selling prices before advertising fixed prices.
- Physically recount the six products with unknown stock quantity/state.
- Reconfirm in-stock and low-stock status before promising availability.
- Supply verified bKash/Nagad receiving details and instructions only if online manual payment is to be enabled.
- Approve any new business claims, delivery terms, warranty details, descriptions or project photos before publication.

## Price and availability rules

- Selling price is the public customer price in BDT, never purchase cost.
- Missing selling price remains null and shows “Price on request”, never ৳0.
- Unknown stock remains unknown and shows “Availability to confirm”.
- Out-of-stock items remain listed with an explicit out-of-stock label.
- Do not infer a price from purchase cost, markup or neighbouring SKUs.
- Do not infer stock from older rows, image files or assumptions.
- Do not invent compatibility, technical specifications, warranties, reviews, delivery costs or service promises.

## Sales activation

Website order requests are currently enabled in the live Supabase settings. Orders are unpaid requests, not proof of accepted stock or payment. Standard (12 hours–1 day, ৳0) and Urgent (30–60 minutes, ৳50) delivery options are configured; the shop confirms actual destination and feasibility. bKash/Nagad remain disabled because their receiving numbers and instructions are unset. Do not enable payments until owner-approved details, server-only secrets and end-to-end verification are in place.
