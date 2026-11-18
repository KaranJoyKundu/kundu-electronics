# Product and inventory data intake

## Current import status — 18 November 2026

The live Supabase catalogue now contains the complete **211-SKU product set (P001–P211)** from the owner's inventory workbook:

- **211 published products**
- **17 published categories**
- **211 inventory records**
- The public catalogue count function returns exactly **211**.

All 211 product image files supplied in the image archive are used. The owner explicitly confirmed permission/licensing for the complete image set. The optimized static sprite at `public/product-previews/kundu-catalogue-sprite.webp` maps one photo tile to each SKU P001–P211. The image credits page lists the 16 owner-supplied photographs and attributes the 19 Creative Commons source photographs.

The workbook's missing customer-facing data was kept missing rather than inferred:

| Inventory field | Current count |
| --- | ---: |
| Selling price not supplied | 49 |
| Stock quantity not recorded | 6 |
| In stock | 129 |
| Low stock | 34 |
| Out of stock | 42 |

Products with no selling price show **“Price on request”**. Products without recorded stock show **“Availability to confirm”**. Out-of-stock products remain listed with their out-of-stock status. Customer-facing quantities are not shown.

## Data privacy and import boundaries

The workbook is a private business source and is not committed to this repository. Only customer-facing fields are imported into public catalogue records.

Never publish or commit:
- Purchase/buying prices, profit margins or markup calculations.
- Supplier identities, supplier contacts or private sourcing notes.
- Private stock notes, reorder details, stock valuation or cash-flow data.
- The raw master workbook, private business documents, credentials or environment files.

## Required owner follow-up

- Confirm the 49 missing customer selling prices before advertising a fixed price for those products.
- Recount the six products whose stock quantity was not recorded.
- Reconfirm in-stock and low-stock states against physical inventory before promising availability.
- Add customer-facing product descriptions and technical specifications only when supported by a reliable product source or owner confirmation.
- Keep variants and price overrides separate; do not combine different models or versions into one listing if their details differ.

## Price and availability rules

- Selling price is the public customer price in BDT, never the purchase cost.
- A missing selling price remains null and is shown as “Price on request”, not ৳0.
- A missing stock quantity remains unknown and is shown as “Availability to confirm”.
- Out-of-stock products are labelled out of stock; they are not silently represented as available.
- Do not infer a selling price from buying cost, markup or a neighbouring product.
- Do not infer stock from old rows, image files or assumptions.
- Do not invent descriptions, specifications, compatibility, warranties, reviews, delivery costs or service promises.

## Image rights and matching

- The owner confirmed permission/licensing for the full supplied 211-image package on 18 November 2026.
- SKU-to-image mapping follows P001–P211 and is implemented by `src/components/product-photo.tsx`.
- The optimized sprite is `public/product-previews/kundu-catalogue-sprite.webp`.
- Attribution and links for the Creative Commons source set are maintained at `/image-credits`.
- If a product image is replaced later, confirm the new file maps to the correct SKU and retain its source/permission information.

## Sales activation

The site currently runs in **enquiry-only mode**. Checkout is disabled in Supabase because payment receiving details/instructions and delivery zones/charges are not enabled. Do not enable checkout until the owner approves those values, server-only secrets are configured, and order creation/payment verification have passed end-to-end tests.
