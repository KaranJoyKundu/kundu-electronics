# SparkFun asset inventory

**Scope:** Public assets surfaced from the SparkFun site and search indexing. No site-wide asset crawl or full asset download was performed.

## 1. Confirmed image/CDN conventions

SparkFun's privacy policy states product images and other resources are served from Amazon CloudFront. The image-query tool returned first-party product photos hosted under `www.sparkfun.com/media/catalog/product/cache/...` and an instructional image under `/media/.renditions/wysiwyg/...`.

### Retrieved first-party product-image examples

| Asset | Source URL | Observation | Reuse status |
|---|---|---|---|
| SparkFun RV-8803 Qwiic real-time clock image | [JPG](https://www.sparkfun.com/media/catalog/product/cache/6481a7e801770ff450b11f3cf63d7638/1/6/16281-SparkFun_Real_Time_Clock_Module_-_RV-8803__Qwiic_-01.jpg) | Red Qwiic board and coin-cell battery on light background. | Publicly retrievable URL surfaced; copyright/permission still applies. |
| SparkFun Thing Plus RP2040 image | [JPG](https://www.sparkfun.com/media/catalog/product/cache/a793f13fd3d678cea13d28206895ba0c/1/7/17745-SparkFun_Thing_Plus_-_RP2040-01a.jpg) | Red development board isolated on light background. | Publicly retrievable URL surfaced; copyright/permission still applies. |
| SparkFun Qwiic Ideation Kit image | [JPG](https://www.sparkfun.com/media/catalog/product/cache/a793f13fd3d678cea13d28206895ba0c/1/6/16262-SparkFun_Qwiic_Ideation_Kit-01b.jpg) | Several red boards/modules and keypad arranged as a kit. | Publicly retrievable URL surfaced; copyright/permission still applies. |
| SparkFun Qwiic Alphanumeric Display image | [JPG](https://www.sparkfun.com/media/catalog/product/cache/f8158826193ba5faa8b862a9bd1eb9e9/1/6/16916-SparkFun_Qwiic_Alphanumeric_Display_-_Red-Demo.jpg) | Display module photographed front-on with lit segments. | Publicly retrievable URL surfaced; copyright/permission still applies. |
| SparkFun IoT RedBoard Kit ESP32 image | [JPG](https://www.sparkfun.com/media/catalog/product/cache/a793f13fd3d678cea13d28206895ba0c/2/0/20672_KIT_SparkFun_loT_RedBoard-_ESP32_Kit-_01.jpg) | Kit contents laid out on a light background. | Publicly retrievable URL surfaced; copyright/permission still applies. |

The retrieval interface previewed image results as square thumbnails, but did not provide trustworthy original pixel dimensions or full image metadata. Do not copy preview dimensions into the eventual asset manifest.

## 2. Instructional/marketing visual asset

| Asset | Source URL | Use | Notes |
|---|---|---|---|
| Documentation callout | [PNG/WebP rendition](https://www.sparkfun.com/media/.renditions/wysiwyg/Documentation/documentation-callout.png?format=webply) | Embedded graphic on SparkFun Documentation landing page. Shows a sample purchase panel, quantity stepper, teal Add to Cart bar, Helpful Documentation links and product detail tab strip. | This is a designed callout illustration, not a current live-site screenshot. Do not use it as a source of exact global theme tokens. |

## 3. Brand assets

- The [Press & Media page](https://www.sparkfun.com/press-and-media) exposes SparkFun logos in several color options, Qwiic logos, building photos and office photos through “Download Logos” / “Download Photos” links.
- Exact downloadable files, formats, sizes and dimensions were not resolved in this session.
- An older PDF/manual-derived visual description shows a SparkFun spark/flame mark above the wordmark; use the official press page for current brand files, not the old document.
- A page states the correct spelling is `SparkFun` (capital S and F); do not reproduce the name as Sparkfun, Spark Fun or sparkfun in editorial text.

## 4. Icons and illustrations

- Product category and product photos are visible as images in page text/search snippets, but a site-wide icon inventory was not retrievable.
- No verified icon library, icon font or sprite URL was identified.
- No complete set of category illustration/banner URLs was extracted.

## 5. Fonts

- No font-family names, font file URLs, weights or license metadata were exposed by the retrieval output.
- Do not assume fonts from screenshots or use a guessed font as a verified finding.
- A real browser/devtools pass should inspect `document.fonts`, computed font-family and network requests for `.woff/.woff2` files.

## 6. Asset acquisition limitations and intellectual property

- Search returned actual public SparkFun CDN URLs, but accessibility is not a reuse license.
- For Kundu Electronics, prefer original product photographs from the seller/manufacturer with permission, and store them as Kundu-owned assets. Reusing SparkFun product photos, logo, Qwiic mark, proprietary illustrations or screenshots requires permission or a valid license.
- No production bundle, entire site dump or screenshot-to-code extraction was used.
