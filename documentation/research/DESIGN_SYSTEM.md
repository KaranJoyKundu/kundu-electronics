# SparkFun design system research

**Status:** Evidence ledger only; not a token-extraction specification.  
**Date:** 12 November 2026.

## 1. Confidence statement

The available browser retrieval tools returned page text, links, form labels and a small number of individual image assets. They did not provide rendered viewport screenshots, computed CSS, browser developer tools or reliable asset metadata. Therefore exact colors, typography, spacing, breakpoints and dimensions are **not measured**. This file intentionally avoids inventing these values.

## 2. Observed design structure

| Area | Verified text/content evidence | What remains unmeasured |
|---|---|---|
| Global header | Repeated pages contain utility links, SHOP, DOCUMENTATION, NEWS, Today's Deals, Community, Toggle Nav, Sign In, My Cart and Search. | Height, columns, alignments, logo size, sticky/fixed behavior, background, border, responsive rearrangement. |
| Search | Search overlay/helper text advertises arrow-key navigation, Enter to select and Escape to close. | Width, open trigger, suggestions visuals, focus ring, keyboard/ARIA behavior, results UI. |
| Category navigation | Nested category structure is present in page text and a Toggle Nav control appears. | Whether current desktop dropdown is a true mega-menu, hover vs click, panel size, animation, mobile drawer details. |
| Category directory | “Shop All Categories” and category family sections link to subcategories and “View All” pages. | Exact columns, card/image geometry, responsive grid. |
| Category listing | Jump-to subcategory links, facets, result counts, sort choices, items-per-page and product results appear in the extracted content. | Sidebar widths, filter accordion visuals, active filter chips, grid column counts, product card dimensions. |
| Product card | Product name, price, possible bulk price, availability, cart/backorder, Compare and Wish List appear in text. | Image ratio, title line clamping, hover treatment, border/shadow, button arrangement. |
| Product detail | Gallery navigation labels, SKU, summary, price, availability, quantity stepper, purchase CTA, documentation and tabs are exposed. | Gallery image sizes, sticky purchase panel, column ratios, tab appearance, mobile order. |
| Cart | Empty-cart heading, no-items message and continue-shopping link. | Populated cart row layout, quantity controls, subtotal, shipping estimate and checkout styling. |
| Forms | Login, registration, contact/quote, newsletter and returns form controls are exposed in text. | Field widths, labels, error messages, focus/validation states, modal behavior. |
| Footer | Company/support links, quote form, newsletter and store selector appear. | Number of columns, background, height and mobile collapse pattern. |

## 3. Colors and imagery

### Verified visual evidence

- Image-query results returned product photography from SparkFun's own `/media/catalog/product/cache/...` image paths. Several examples show red PCB boards and small electronics on a light/white studio background.
- An official documentation callout image at `https://www.sparkfun.com/media/.renditions/wysiwyg/Documentation/documentation-callout.png?format=webply` depicts a sample product purchase area with a teal-colored Add to Cart bar, a quantity stepper, “Helpful Documentation” links and a tab bar. This is an embedded instructional asset, not a screenshot captured from a current product page in this session.
- SparkFun's Press & Media page says the official logo has several color options and provides logo downloads. The exact current site logo file and its variants were not individually downloaded.
- An older PDF-derived visual description depicts the SparkFun wordmark with red spark/flame mark and black wordmark, but this is not a substitute for extracting the current logo asset.

### Not verified

No exact hex/RGB/HSL values were measured for the live site's primary, secondary, accent, background, text, border or status colors. Avoid carrying over a teal color as the entire site accent solely from the instructional callout image.

## 4. Typography

- The current site font families, font files, font weights, sizes, letter spacing and line heights were not exposed in the retrieval output.
- Do not assume a common system font or Google Font.
- A full visual/browser source pass should inspect loaded font resources and computed styles for body, headings, nav, product titles, prices, labels and forms.

## 5. Spacing, geometry and component styling

No numeric values are available for:

- Max content width / container width.
- Desktop, laptop, tablet or mobile gutters.
- Header, announcement bar or footer height.
- Product image ratio or product card width/height.
- Product grid columns.
- Sidebar width.
- Spacing scale.
- Border widths/radii.
- Shadow blur/opacity.
- Button height/padding/radius.
- Form control height.

Do not turn guesses into design tokens. When the live browser becomes available, capture representative pages at 1440×900, 1366×768, 768×1024 and 390×844, then record actual measurements with a tolerance note.

## 6. Responsive behavior — pending

Evidence includes a `Toggle Nav` control and mobile-oriented labels/structure, but no actual narrow viewport was rendered. The following remain unknown:

- Header transition breakpoint and drawer/modal behavior.
- Whether desktop mega-menu transforms to nested accordion navigation.
- Sidebar behavior (hidden, drawer, top filter panel or inline).
- Product grid columns at tablet/mobile.
- Whether product gallery becomes swipeable.
- Sticky/stacked product purchase panel.
- Footer and forms reflow.

## 7. Screenshot inventory

No page screenshots were captured. The image-query tool surfaced one embedded instructional graphic and product photo assets, but these are not complete viewport screenshots. The screenshot capability available through the web interface is for previously opened PDF pages, not arbitrary live web pages. No screenshots directory or screenshot files are therefore claimed.

## 8. Required visual pass checklist

1. Capture the homepage at 1440×900, 1366×768, 768×1024 and 390×844.
2. Capture one top-level category, one deeply nested category, a curated listing, a standard in-stock product, an out-of-stock product, cart, login and support page at desktop and mobile.
3. Measure header/footer, content width, listing grid columns, card/image ratio, facets sidebar and detail-page column ratios.
4. Inspect hover/focus/active/disabled states for nav, search, filters, quantity and purchase buttons.
5. Extract CSS custom properties or computed styles for colors, type, spacing, borders and shadows.
6. Inspect loaded webfont requests and save asset URLs/format/dimensions.
7. Record exact viewport/browser/zoom and date with each screenshot.
