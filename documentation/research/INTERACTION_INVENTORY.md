# SparkFun interaction inventory

**Rule:** “Visible” and “verified working” are different states. This research environment did not expose a live JavaScript browser or interactive pointer/keyboard control. Consequently no shopping/navigation interactions were marked behavior-verified.

## Status legend

- **Observed control/copy:** control or intended behavior exposed in page text.
- **Documented behavior:** page copy or support docs describe behavior, but it was not independently executed.
- **Not tested:** interaction requires a live browser or a stateful user session.
- **Not accessible:** route or content could not be retrieved by this tool.

## Navigation

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-001 | Main navigation | SHOP, DOCUMENTATION, NEWS, Today's Deals, Community links | Click/tap each link | Link labels present; pages/routes identified for several | Navigation itself not clicked |
| I-002 | Category menu tree | Nested taxonomy; Toggle Nav / Menu control | Hover SHOP/category, click, keyboard focus; open nested levels | Category hierarchy appears in page text | Current mega-menu visual behavior unknown; 2017 redesign article is historical only |
| I-003 | Mobile menu | Toggle Nav / Menu button | Tap, open nested category, close via button/backdrop/Escape | Only control label observed | No mobile viewport/browser |
| I-004 | Header utility links | Professional, EDU, Distributor, Customer Support | Activate each | Customer support pages and distributor route discovered | Some external or account-specific destinations not tested |
| I-005 | Breadcrumbs | Parent category context (not consistently exposed) | Select ancestor link | Not verified | Capture on representative deep category/product pages |

## Search

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-006 | Search open | Global Search field/button and `search...` placeholder | Focus/click field | Helper text appears in extracted page: keyboard navigation instructions | Open trigger/overlay layout not tested |
| I-007 | Autocomplete | Helper copy: arrow keys, Enter, Escape | Type a query; arrow through results; press Enter/Escape | Intent is advertised; no suggestions retrieved from a live session | Product-vs-content results, no-results, debounce, keyboard focus unknown |
| I-008 | Search results page | Attempted `/catalogsearch/result/?q=breadboard` | Submit a real query | Direct route failed in retrieval tool | This is a tool limitation unless tested in normal browser |
| I-009 | Cross-content search | Privacy policy says Elasticsearch serves product, blog, tutorial, wish-list and other search results | Search across content types | Documented by privacy policy | No query-type test |

## Category/listing filters and sorting

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-010 | Facet open | Filter groups e.g. Form Factor, Qwiic Connector?, Brands, SparkFun Original | Click facet group | Buttons and options/counts exposed | Expand/collapse state not tested |
| I-011 | Apply filter | Facet option with item count | Select one option | Not tested | Need test URL/state persistence, counts, reset and combining facets |
| I-012 | Remove/reset filter | Active filter/reset control not established by text | Remove chip/clear filters | Not observed | Requires live browser |
| I-013 | Price filter | Development Boards URL exposes `?price=amshopby_slider_from-amshopby_slider_to` | Inspect visible slider/min-max fields; apply a range and inspect URL/results | URL-state evidence found; actual UI control and result behavior not retrieved/tested | Tokens imply a lower/upper slider range parameter; concrete values, input design and reset behavior unknown. Curated `Items $20 - $30` collection is a separate feature. |
| I-014 | Sort | Position, Product Name, Price, Newest/Oldest choices | Select each sort mode | UI copy states selection refreshes page with new results | Actual order not tested; sort direction control also visible |
| I-015 | Sort direction | Set Descending Direction/select | Toggle ascending/descending | Control label observed | Actual direction/order not tested |
| I-016 | Items per page | Selector after “Items per page” | Change page size | Control observed; copy says selection refreshes results | Available sizes and effect not tested |
| I-017 | Pagination | `Items 1-24 of N`; indexed `?page=1` and `?p=5` URLs | Next/previous, direct page query | Page-related routes and counts observed | Controls, URL parameter semantics and page-state reset untested |

## Product cards and detail pages

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-018 | Product-card navigation | Product titles/images in listing | Open product | Many exact detail URLs identified | Link target confirmed for samples; click-through not independently tested |
| I-019 | Card Add to Cart | Add to Cart visible on in-stock products | Click and inspect cart feedback/cart count | CTA text observed | No product added; notification/cart state unknown |
| I-020 | Backorder | Backorder button for reservable unavailable product | Click and inspect explanation/flow | Backorder CTA/status observed | Actual reservation flow untested |
| I-021 | Out-of-stock notification | Notify me when this product is in stock | Submit email/subscribe | CTA/copy observed on samples | Whether login required, consent and success state unknown |
| I-022 | Product gallery | Gallery start/end navigation labels and multiple image inputs | Click thumbnails/next; zoom/lightbox | Gallery structure observed | Image switch, zoom, gestures and responsive behavior not tested |
| I-023 | Quantity minus | Minus button | Click repeatedly near minimum | Button observed | Minimum quantity, disabled state and validation unknown |
| I-024 | Quantity plus | Plus button | Increment repeatedly | Button observed | Maximum quantity and stock cap unknown |
| I-025 | Quantity input | Numeric quantity input | Type zero, negative, decimal, large number | Input observed | Validation not tested |
| I-026 | Product variants/options | No selection widget verified in sampled details | Find an actual configurable SKU; switch option | None confirmed | Keep pending; similar separate products/filters are not variants |
| I-027 | Documentation links | Hookup Guide, Schematic, Datasheet, Register Map | Open a document/guide | Link labels and documents observed | Link targets/file downloads untested |
| I-028 | Product detail tabs | Overview, Recommended Products, Features & Specs, Documentation, Reviews | Activate each tab | Labels and section content observed | Whether tabs use JS, anchors or scroll not tested |
| I-029 | Reviews | Customer Reviews / Trustpilot reference | Open/review/submit | Review label/provider observed | Widget load and submission not tested |
| I-030 | Bulk discount display | 10+, 25+, 100+ price tiers | Change quantity above threshold | Tier table observed | Automatic price change and threshold application not tested |
| I-031 | Volume quote form | Get a Quote for product; name/email/phone/comment | Submit form | Form fields observed | Validation, routing, confirmation untested |
| I-032 | Compare | Compare control on product cards | Add two products, open compare list | Global Compare Items / Clear the list text observed | Compare data and screen behavior not tested |
| I-033 | Wish list | Add to Wish List control | Add item signed out/in | Control observed | Authentication and persistence unknown |

## Cart and checkout

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-034 | Empty cart | Cart route with “You have no items in your shopping cart” | Open fresh cart | Empty state directly observed | Empty-state layout/continue-shopping link not clicked |
| I-035 | Add then cart update | Product CTA | Add product then open cart | Not tested | Cart count, feedback, totals and line rendering unknown |
| I-036 | Remove item | Populated cart row | Remove product | Not tested | Empty-state transition unknown |
| I-037 | Cart quantity changes | Populated cart quantity control | Increase/decrease; inspect subtotal | Not tested | Rounding/tax/shipping recalculation unknown |
| I-038 | Cart persistence | Login Remember Me helper mentions shopping-cart access | Add item, reload, open second session, sign in/out | Copy is documented; actual persistence not tested | Cookie/local storage/account merge behavior unknown |
| I-039 | Checkout navigation | Support docs describe Proceed to Checkout | Continue from populated cart | `/checkout` entry was inaccessible to tool | Guest/account checkout, redirect and form steps not visually inspected |
| I-040 | Guest checkout | Support page documents account or Guest option | Choose guest at checkout | Documented, not executed | Account prompts and guest data persistence unknown |
| I-041 | Payment/shipping steps | Support docs describe address, shipping, payment and order place | Complete a non-purchasing test flow (no real order) | Flow described in support text | No test order submitted; real payment not attempted |

## Account/support/forms

| ID | Interaction | Initial state / control | User action to test | Observed result in this research | Verification / edge cases |
|---|---|---|---|---|---|
| I-042 | Login | Email/password, Remember Me, Sign In | Submit valid/invalid credentials | Form controls observed | Authentication behavior not tested |
| I-043 | Forgot password | Dedicated `/customer/account/forgotpassword/` page with email field and Reset My Password action | Submit a real test address in a controlled session | Page/control observed; submission and email delivery not tested | Reset confirmation, expiry and abuse protection unknown |
| I-044 | Registration | Name/email/password/confirm/newsletter/remote assistance | Submit invalid/valid form | Fields and password-strength indicator observed | Validation and confirmation not tested |
| I-045 | Support/contact form | Contact route and support ticket direction | Submit a support request | Contact channels observed | Form interaction and ticket outcome not tested |
| I-046 | Returns form | Return page initiation form | Enter order/product reason and submit | Form presence observed after policy | Eligibility validations and submission untested |
| I-047 | Newsletter | Footer email signup and dedicated `/subscribe` page | Submit valid/invalid email | Dedicated page and email field/copy observed | Opt-in validation, double opt-in and confirmation not tested |
| I-048 | Distributor map | iframe map | Pan/zoom/select distributor | iframe presence observed | Map loaded/interactions not tested |

## Most important next tests

1. Run desktop and mobile menu hover/click/focus tests.
2. Test autocomplete with common, partial, SKU and no-match queries.
3. Apply two facets together, clear them, use browser back and refresh.
4. Confirm the visible price filter UI, exact min/max fields and range-application behavior; the catalog URL already exposes a price-range slider parameter.
5. Test sort/direction/page-size/pagination interactions.
6. Find at least one true configurable product if one exists; otherwise record “none found in tested sample.”
7. Add/remove/change product quantities in a real cart and test persistence.
8. Inspect guest checkout without placing a real order; avoid any payment submission.
