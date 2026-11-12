# Product and inventory data intake

## First required file

Supply the latest document you actually maintain for product names, SKU/model, stock and pricing (Excel, CSV, Google Sheets export, PDF or another editable format). If it includes both purchasing cost and selling price, keep the original file private and tell the implementation agent which column is the customer-facing selling price. Do not strip columns from the original just to upload it; we will inspect and map it safely.

## Public fields required for a basic listing

- SKU or stable product identifier
- Customer-facing product name
- Customer-facing selling price in BDT
- Category (may be mapped after review)
- Actual availability state

Useful optional fields:

- Brand / manufacturer
- Short and long descriptions
- Technical specifications
- Product image(s) with usage permission
- Datasheet / hookup guide / official product URL
- Variant/option information

## Import safety rules

- Supplier buying price, cost, margin, supplier identity, private notes and reorder planning are internal fields only.
- Public `Product` and public JSON/API output must contain only selling price (`priceBdt`).
- Do not infer selling price from buying price or apply an assumed markup.
- Unknown prices are not publishable.
- Do not infer stock quantity or stock state from an old row; ask for confirmation or leave unpublished.
- Duplicate SKU/slug must be reported, not silently overwritten.
- Product images should be supplied by Kundu or licensed/authorized sources. SparkFun image URLs are research references, not permission to reuse them.
- All imported products begin unpublished until the mapping and public preview are checked.

## Image guidance

Original product photos are preferred. Useful initial input is one clear image per product with its SKU in the filename, for example `SKU-123-front.jpg`. Do not add fake product photography or stock images as if they were the real item.
