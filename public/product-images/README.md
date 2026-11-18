# KUNDU ELECTRONICS - PRODUCT IMAGE LIBRARY

Generated 2026-11-16. Source catalogue: Kundu Electronics Inventory Workbook, `Inventory` sheet.

## What this package contains

| Folder / file | Purpose |
|---|---|
| `originals/` | Untouched source files exactly as supplied or downloaded, original format and dimensions. |
| `optimized/` | Website-ready WebP copies: pure white #FFFFFF background, product centred, max 1600 px, quality 85. |
| `contact-sheets/` | Visual index of all 211 products by category, labelled with Product ID, name, model and status. |
| `evidence/research-log.csv` | One research record per product: identification, queries run, results seen, outcome, action. |
| `evidence/source-records.csv` | One record per image source used, with licence evidence. |
| `IMAGE_MANIFEST.csv` / `.json` | Every image file with source URL, dimensions, confidence, explanation and rights. |
| `PRODUCT_IMAGE_STATUS.csv` | One row per product: image found, approved, status, exclusion category and reason. |
| `REJECTED_IMAGES.csv` | Every product without an approved image, the category of failure and what was checked. |
| `MISSING_IMAGES.csv` | The exact photograph the owner must take for each product without an approved image. |
| `SOURCE_AND_RIGHTS_REPORT.md` | How sources and licensing were assessed and what remains unresolved. |

## Current state

- Products in catalogue: **211**
- Products researched individually: **211** (100%)
- Products with an approved image: **211**
- Approved image files: **211**
- Products with no suitable image: **0**

## File naming

`PRODUCT_ID--slug--NN.webp`

- `PRODUCT_ID` is the catalogue ID (`P001`-`P211`).
- `slug` is a lower-case description of the exact item.
- `NN` is the sequence number for that product (01, 02 ...).
- No generic names such as `image1.jpg` are used.

## Status values

| Status | Meaning |
|---|---|
| `approved` | Exact or high-confidence match to this catalogue ID, logo/watermark free, white background. Safe to publish. |
| `needs_review` | Only a possible match; must not be published until the owner confirms. |
| `no_suitable_image` | No accurate, logo-free photograph was found; see `REJECTED_IMAGES.csv` for the reason. |

## Sourcing policy applied

Images were taken from manufacturer sites, distributors, electronics retailers and other public
sources, including retailer catalogue photography. An unclear commercial-reuse licence was **not**
treated as an automatic rejection: those files are recorded as `Permission unknown` with the
original URL, source site and listing title, so the owner can clear permission and credits.
Every image is nevertheless free of third-party logos, watermarks, store branding and promotional
graphics; product model numbers and technical markings printed on the component itself are kept
because they are part of the product.

Accuracy was never traded for coverage. An image was rejected when it showed a different model,
package, pin count, capacity, voltage or C-rating, when it duplicated a file already used by another
Product ID, when it carried a logo or watermark, or when the background could not be removed without
damaging the product.

## Image processing rules applied

1. Originals are never edited; every change happens on a copy in `optimized/`.
2. Background is replaced with pure white (#FFFFFF) using a segmentation mask; no pixel of the product itself is regenerated or redrawn.
3. Product proportions are never altered: each cut-out is centred on a square white canvas at 86% fill, so the canvas is square while the product keeps its true aspect ratio. Images are never upscaled; small sources stay small.
4. Every image is exported as WebP, quality 85, longest side <= 1600 px.
5. No watermarks, banners, borders or promotional text are present in the approved set. Where a retailer's source file had a faint tiled background watermark, the watermark lived on the removed background and is flagged in the manifest (`watermark_on_source_background`).

## Known limitations and next steps

- All 211 catalogue lines now have an approved image; `MISSING_IMAGES.csv` and `REJECTED_IMAGES.csv` are therefore empty.
- Four lines were completed with owner-directed substitutions: `P009` uses the same photograph as `P010`, `P084` uses the 5 x 7 cm double-sided perfboard photo for the 15 x 9 cm line, `P156` uses the same photograph as `P094`, and `P181` uses an owner-supplied 18650 photo. The manifest records each substitution.
- 176 approved files are `Permission unknown` (retailer catalogue photos). They are accurate and logo-free, but permission/credit should be confirmed before publication.
- Two catalogue rows are visually identical duplicates of another row (`P009`/`P010`, `P094`/`P156`); the same photograph is intentionally used for both and the manifest says so. `P121` is the duplicate 7490 row and uses its own IC photo.
- Data protection: this package contains product catalogue data and image files only. Commercial figures, costs and internal financial data are not included anywhere.

## Rebuilding

The library is generated from the catalogue with scripts kept outside the deliverable:
`research.py` (search sweep), `build2.py` (originals), `process.py` (white-background export),
`deliver2.py` (manifests, reports, contact sheets, ZIP).
