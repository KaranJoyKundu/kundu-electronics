# SparkFun reusable component inventory

**Evidence level:** Components below are identified from repeated page text, accessible labels, navigation structures and product/page patterns. Visual styling and all dynamic behavior remain pending unless specifically noted.

| Component | Purpose | Variants / observed states | Appears on | Interactions / dependencies | Evidence status |
|---|---|---|---|---|---|
| Utility header | Cross-site quick links | Professional, EDU, Distributor, Customer Support | Home, catalog, product, account, support, company | Links navigate to business/support areas | Text structure verified; layout unmeasured |
| Primary navigation | Main site areas | SHOP, DOCUMENTATION, NEWS, Today's Deals, Community | Repeated site pages | Route navigation; category menu interaction pending | Text structure verified |
| Category tree / mega-menu candidate | Deep catalog discovery | 16 groupings including Featured and technical categories; 2–3 levels deep in places | Repeated pages, all-categories, sitemap | Hover/click/current menu behavior untested; historical 2017 article describes mega-dropdown | Tree verified; present-day visual behavior unverified |
| Mobile nav toggle | Expose navigation in compact layout | Toggle Nav / Menu button text | Repeated pages | Click/touch state and drawer behavior not tested | Control label observed |
| Account control | Sign in / account entry | Sign In, Account button | Global header, account routes | Opens account area | Control observed; navigation not clicked |
| Cart control | Cart access | My Cart | Global header, cart | Opens cart page | Link observed; populated-state not tested |
| Search field/autocomplete | Search store content | Search overlay, Search button, keyboard instructions | Global pages | Arrow keys, Enter, Escape advertised; no query entered | UI helper text observed; behavior untested |
| Breadcrumb/context links | Orient within taxonomy | Parent category context | Category/product pages (not consistently exposed by text extractor) | Navigate to parent | Requires browser confirmation |
| Category jump links | Skip to subcategory | Links with counts | Top-level and nested category pages | Navigate to child listing | Text/link structure observed |
| Category intro block | Explain category | Intro paragraph present on some family/subcategory pages | GNSS, components, robotics hardware, kits and other listings | Static editorial content | Observed on selected categories |
| Facet/filter group | Narrow result set | Form Factor, Qwiic, Brands, SparkFun Original, audio functions, GNSS module/antenna attributes | Category listings; available facets vary by category | Apply/remove filter, chips/count changes not tested | Facet labels/options observed |
| Product list toolbar | Sorting and per-page control | Position, Product Name, Price, Newest/Oldest; direction; items per page | Category listings | Page refresh stated by UI copy; not executed | Control/label observed |
| Product card | Preview and shop item | Image, title, standard/special price, bulk price, stock state, CTA, Compare, Wish List | Home carousels and catalog listings | Link/add/compare/wishlist controls; not activated | Text structure observed |
| Product availability badge/CTA | Communicate fulfillability | In stock/Add to Cart, Backorder, Out of stock/Notify me, Discontinued | Product cards/details | CTA state depends on product status; not tested | Multiple states observed in examples |
| Featured product carousel | Highlight products | Previous/Next/slide dots described | Home, all-categories, family landing pages | Carousel control interaction not tested | Carousel text/controls observed |
| Product image gallery | Show multiple product images | “Skip to end/beginning of images gallery”; image item labels | Product detail pages | Image navigation/zoom not tested | Gallery structure observed |
| Product purchase panel | Core conversion area | SKU, summary, price, availability, quantity, Add to Cart/backorder/notify | Product detail pages | Depends on SKU status and stock; not tested | Multiple detail examples |
| Quantity stepper | Set quantity before purchase | Minus, numeric input, plus | In-stock product detail sample | Increment/decrement and min/max behavior untested | Controls observed |
| Helpful Documentation panel | Surface technical files | Hookup Guide, Schematic, Datasheet, Register Map, See all documentation | Product detail examples | Opens documents/guide routes; links not individually tested | Content links observed |
| Product detail tabs/sections | Organize technical content | Overview, Recommended Products, Features & Specs, Documentation, Reviews | Product detail sample | Tab-switch behavior not tested; may be anchored/JS tabs | Tab labels observed |
| Technical feature/specification list | Support evaluation | Bullets or key/value table (MCU, voltage, clock, flash, interfaces, sensor ranges) | Board/sensor detail pages | Static/linked documentation | Observed in RedBoard/BME280 excerpts |
| Related/recommended products | Cross-sell accessories | Related items with title/price/status; feature modules/badges | Qwiic Twist detail | Product navigation; not tested | Content observed |
| Bulk discount tiers | Display volume price | 10+, 25+, 100+ tiers and volume pricing contact | Qwiic Twist, RedBoard, BME280 examples | Quote route for larger quantity; no quantity-price calculation tested | Price tier content observed |
| Reviews module | Trust / feedback | Reviews tab; Trustpilot-powered customer reviews on sample detail | Product detail pages | Expand/review-submit behaviors untested | Content labels observed |
| Product quote form | Request large/custom quote | Privacy consent, Customer Name, Email, Phone, Comment, Submit | Home/product/cart page extracts | Form submit, validation and route untested | Field labels observed |
| Empty cart state | Explain empty cart | “You have no items…” and continue-shopping link | Cart | Link returns to shopping | Empty state observed; populated state absent |
| Checkout journey | Convert cart to order | Guest/account, address, shipping, payment options, discount/gift certificate/PO, order placement | Described in support hub; checkout entry unavailable | No actual checkout executed | Documented in support prose only |
| Login form | Authenticate | Email, password, Remember Me, Sign In, Forgot Password | Login | Submit/reset not tested | Fields and actions observed |
| Registration form | Create account | Name, email, password, confirm, strength, newsletter, remote-assist opt-in | Create-account page | Submit/validation not tested | Fields observed |
| Support table of contents | Navigate policy/help topics | Orders, shipping, payments, general | Support hub | In-page anchor behavior not tested | Headings/section labels observed |
| FAQ content | Answer common questions | Account, guest checkout, backorders, shipping, order status | FAQ | Accordion behavior not confirmed; text content exposed | Page text observed |
| Contact form/links | Contact support/sales | Support, sales, technical assistance channels | Contact page | Form submission untested | Contact content observed |
| Return initiation form | Start return | Form introduced after eligibility/policy content | Returns page | Submit and validation not tested | Form presence observed |
| Newsletter form | Marketing signup | Email field and signup copy | Footer/home/product/cart | Subscribe behavior untested | Field observed |
| Footer / store selector | Site-wide navigation | About, Press, Education, Jobs, partner/support links, Select Store | Repeated page endings | Store selection not tested | Text links observed |
| Learning/resource card | Connect products to tutorials | Image, title, View Tutorial/Guide | All-categories/category pages/home | Open guide/video; not clicked | Text and card structure observed |
| Distributor map iframe | Show reseller/distributor geography | Embedded map on Distributor page | Distributor page | Map interactions not accessible in extraction | iframe presence observed |

## Component implications for Kundu

Prioritize: header/search, category navigation, category shortcuts, facet filters, product list toolbar, product card, product detail gallery/purchase panel, quantity stepper, cart drawer/page, checkout instructions/form, footer and policy/support content. Do not replicate large enterprise/partner elements unless Kundu has real content for them. Use real product and business data for all cards/forms.
