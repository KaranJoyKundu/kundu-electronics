# Issues and limitations

**Snapshot date:** 12 November 2026.

## 1. Browser/tool limitations

1. The available web tool retrieves search-index excerpts and page text; it is not a full Chrome/Playwright session.
2. It cannot reliably execute JavaScript-driven controls, hover/click menus, type into forms, inspect the browser console/network panel, or maintain a shopping session.
3. The webpage screenshot capability available in the toolset is intended for opened PDF pages. It does not capture arbitrary live HTML pages. Therefore no SparkFun viewport screenshots were captured.
4. No CSS/computed-style extraction was available. Exact colors, font families, sizes, line heights, container widths, grid columns, spacing, border radii, shadows and responsive breakpoints remain unknown.
5. Search-result page snippets may represent indexed content captured at different moments. Item counts/prices/stock labels can be stale or change after the snapshot.

## 2. Explicit failed or limited route attempts

| Route | Result in this session | Interpretation |
|---|---|---|
| `https://www.sparkfun.com/robots.txt` | Direct open returned inaccessible/tool error. | Robots policy not inspected. This is not proof of robots denial. |
| `https://www.sparkfun.com/sitemap.xml` | Direct open returned inaccessible/tool error. | XML sitemap not inspected; public HTML sitemap `/sitemap` was accessible. |
| `https://news.sparkfun.com/` | Direct open returned HTTP 403 Forbidden. | News subdomain content could not be inspected with this tool. Main site still links to NEWS and Latest News. |
| `https://learn.sparkfun.com/tutorials/` | Search index returned tutorial listing (956 tutorials in that snapshot); direct open returned HTTP 403 Forbidden. | Tutorial index is discoverable but full detail pages could not be inspected. |
| `https://learn.sparkfun.com/tutorials/getting-started-with-arduino` | Direct open returned inaccessible/tool error. | Example tutorial route not inspected. |
| `https://www.sparkfun.com/catalogsearch/result/?q=breadboard` | Direct open returned a tool error. | Search result interaction could not be verified. Not proof search is broken. |
| `https://www.sparkfun.com/checkout` | Direct open returned a tool error. | Checkout sequence could not be inspected. Cart route and support documentation were accessible. |

`https://www.sparkfun.com/shipping` redirected to `/support`; shipping policy is a section of the support hub rather than a separately observed standalone page.

## 3. Interaction gaps

No actual interactive behaviors were verified in a real browser. Specifically pending:

- Current mega-menu hover/click/keyboard/mobile behavior.
- Search autocomplete results, no-results, debounce, keyboard focus and submit behavior.
- Whether category filters are dynamically applied, and how combined/reset filters behave.
- Visible price-range control, concrete lower/upper bounds, validation, URL update and result behavior (query-parameter evidence exists, but UI was not extracted).
- Sort order/direction, items per page and pagination results.
- Product gallery change/zoom/swipe behavior.
- Quantity min/max/stock validation.
- Add-to-cart notification, cart counter and cart-line rendering.
- Backorder and stock-notification submissions.
- Any true configurable product options.
- Compare and Wish List flows.
- Cart editing, totals, persistence, reload and guest/account merge.
- Checkout form, guest flow and payment screen. No actual order or payment was attempted.
- Login, registration, forgot-password, contact, return and newsletter form submissions.

## 4. Responsive/layout gaps

No layout was inspected at 1440×900, 1366×768, 768×1024 or 390×844. The existence of a Toggle Nav label is not enough to infer the exact responsive layout. Need actual viewport captures and measurements.

## 5. Asset gaps

- No complete logo file or its variants downloaded; the Press & Media page exposes a logo download affordance.
- No exact font file URLs or font metadata discovered.
- No exact intrinsic dimensions for product images.
- No comprehensive category/banner/icon asset catalogue.
- Public image URLs are not proof of permission to reuse them.

## 6. Coverage quality caveats

- The route-record total is stated in `README.md` and `PAGE_INVENTORY.md`; records include canonical routes, legacy routes, alternate query states, external domains and explicitly failed attempts.
- The inventory does not claim every leaf category or every individual SKU page was visited. The site's product count is large and changes regularly.
- The hierarchy is broad and grounded in the HTML category directory/sitemap, but some category labels differ slightly between directory text and indexed catalog facets (e.g. “Other” vs “Other Robotics Gear”, “E-Textiles” naming, “RTC” vs “Real Time Clock”). Preserve canonical labels after a live implementation-time check.
- No current full product-option/configurable page was identified. This does not prove none exists. A separate password-recovery route and dedicated newsletter subscription route were added to the expanded route inventory.

## 7. What is safe to conclude

- SparkFun exposes a large multi-level product taxonomy, curated collections and support/learning/company sections.
- Common listing pages expose subcategory shortcuts, variable facets, sort and per-page controls, and product cards with price/availability/commerce affordances.
- Multiple product-detail availability states exist, and product pages surface documentation and technical specifications.
- The website has account routes, a cart route and support-described guest checkout.
- The website's current visual system and dynamic behavior are **not fully reverse-engineered** by this session.

## 8. No changes to Kundu project

The local Kundu project was not accessed. No source code was written or modified, no packages installed and no local project configuration examined.
