# Product and inventory data intake

## Source-derived candidate status

The owner-provided `Business Website.md` includes a preliminary table of component/kit customer selling prices and three robot-project price lists. A separate proposal was generated outside this Git repository at `/mnt/data/kundu-private-import-proposal/`:

- `IMPORT_REVIEW.md`
- `product-candidates.csv` / `product-candidates.json`
- `robot-project-price-ranges.csv`

Summary of that proposal: **74 component/kit candidates**; 66 have one integer price in the brief; 8 require review due to alternatives, estimates or ranges. The robot project entries are nine tiered price ranges and are not individual component SKUs. All candidates remain `draft_not_imported`; none are published.

Do not put original internal inventory or purchasing-cost files in Git. The candidate proposal does not include supplier or purchase-cost columns.

## Original source files still required

The business brief refers to these files, but they were not attached in this session:

1. `Bussiness/pricing_and_inventory.md` — master inventory and stock/pricing source.
2. `Bussiness/Final Product with prices/component_pricing_analysis.md` — detailed price analysis/source for the candidate table.
3. `Bussiness/Final Product with prices/Robot_Price_Lists.md`.
4. `Bussiness/Final Product with prices/robot_selling_price_list.md`.
5. `Bussiness/Final Product with prices/robot_project_selling_prices.md`.
6. Relevant component/product PDFs, datasheets, real product photos, kit contents and robot build documents.

Ask for only relevant source files as each data group is prepared; do not ask owner to upload all files at once. The source files may contain buying price/supplier/private notes and must remain outside the public project source and Git history.

## Required per-product confirmation

- Product name and model/SKU (if one exists).
- Category.
- Exact public selling price in BDT.
- Variant/option distinction and any price override.
- Actual availability and stock-tracking mode; no quantity guessing.
- Customer-facing description and technical specs with source.
- Owner-provided or licensed product image(s), alt text and order.
- Publication approval.

## Price classification

- A single explicit integer selling price in the brief is a **candidate**, not automatic approval.
- Slash-separated values require clarification and must not be auto-resolved.
- Estimates remain unconfirmed.
- Price ranges remain ranges and cannot be used as fixed SKU prices.
- Unknown/missing prices render neither as zero nor as a fabricated value.

## Import safety

- Strip purchasing-cost, supplier, margin, source notes, reorder data and internal inventory fields before data enters application/admin/public schemas.
- Do not infer selling price from cost or markup.
- Do not infer stock from old rows; use `unknown` until confirmed.
- Duplicate SKU/slug must be reported, not overwritten.
- All rows start as draft. Public `Product`/API contracts contain `priceBdt` (selling price) only, never buy cost.
- No false product photography, specifications, reviews, shipping claims or stock indicators.
