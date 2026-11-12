# SparkFun website research report

**Reference:** [SparkFun Electronics](https://www.sparkfun.com/)  
**Snapshot date:** 12 November 2026 (Asia/Dhaka)  
**Scope:** Public reference website only; Kundu Electronics local source project intentionally out of scope.

## 1. Executive summary

SparkFun is a product-commerce website combined with technical education, support, community and company/partner content. Its public structure is not just a homepage plus catalogue. The reference's useful patterns are:

- A large, hierarchical category system with both top-level landing pages and deep subcategory pages.
- Curated product collections alongside conventional taxonomy (Featured, Best Sellers, New Products, SparkFun Originals, SparkX, Qwiic, brands and clearance).
- Category landing pages that combine subcategory shortcuts, category-specific product facets, a sorted/paginated product list and, on some pages, educational resources or featured-product carousels.
- Product detail pages with a gallery, SKU, price, stock state, quantity control, add-to-cart/backorder/notify state, documentation links and tabbed technical detail.
- An integrated support and learning layer: documentation, hookup guides, FAQ, support, return, contact, and community forum pages.
- Account registration/login/password recovery, a cart route, guest checkout described by support material, product comparison/wish-list affordances, global quote forms and a dedicated newsletter signup page.

A key distinction: the website research here is strong at **information architecture and textual page structure**, but incomplete for **visual reverse engineering and live interaction verification**. The available tools could read pages and link destinations but could not run the website in a real viewport, hover menus, activate JavaScript controls or capture rendered page screenshots.

## 2. Method and evidence grading

### Methods used

- Retrieved the homepage and public HTML sitemap.
- Opened the all-category directory and a broad set of top-level and nested category pages.
- Retrieved search-index excerpts for additional category, product, company, support and learning routes.
- Opened example product pages in multiple availability/product-content states.
- Opened cart, login, registration, support, FAQ, contact, returns, terms, privacy, documentation, about, press, partner, distributor and community pages.
- Attempted direct access to `robots.txt`, `sitemap.xml`, search results, checkout entry, SparkFun News and SparkFun Learn tutorials.
- Queried product and documentation images to identify actual public image/CDN paths.

### Evidence labels

- **Direct text:** URL opened successfully and page text was returned.
- **Search excerpt:** a search result returned substantial page text, but a full page open was not completed.
- **Redirect:** a URL redirected to another observed route.
- **Failed fetch:** the browser retrieval tool returned an explicit error/403. This is a limitation of this research environment, not proof the page is unavailable to ordinary visitors.
- **Untested:** a control or behavior was visible but not activated.

## 3. Site-level information architecture

### 3.1 Global header and navigation structure

Repeated page text exposes these common areas:

**Utility-level links:** Professional, EDU, Distributor, Customer Support. Customer Support is associated with Support Home, Returns & Exchanges, FAQs, Contact Us and the Technical Support Forum.

**Primary navigation:** SHOP, DOCUMENTATION, NEWS, Today's Deals and Community.

**Commerce/account controls:** Toggle Nav, Sign In, My Cart and Search. The search field's accessible helper text says: “Search entire store. Use arrow keys to navigate autocomplete results, enter to select, escape to close.” This is evidence that the interface advertises keyboard-operable autocomplete; it is not evidence that autocomplete suggestions were exercised in this session.

**Category navigation tree:** the site text contains a nested taxonomy (see `PAGE_INVENTORY.md`). The same tree appeared in the document structure of several pages, including company and support pages. The presence of a Toggle Nav control suggests a collapsible navigation presentation, but actual desktop mega-menu and mobile drawer behavior were not tested.

A SparkFun post announcing a 2017 site redesign describes a mega-dropdown that opened on rollover or click and a move to faceted category search. Treat this as historical context only; it does not establish current interaction details.

### 3.2 Catalog hierarchy

The accessible category directory and sitemap establish these principal catalog groupings:

1. Featured
2. GPS / GNSS
3. Sensors
4. Development Boards
5. IoT & Wireless
6. Components
7. Kits
8. Robotics
9. Tools
10. Audio
11. Displays
12. E-Textiles & Crafting
13. Data Logging & Memory
14. Books and Merch
15. Special Categories
16. Custom (listed as a catalog grouping in an indexed all-products category snapshot)

The directory's visible “Shop All Categories” presentation is grouped into families such as Audio, Components, Data Logging & Memory, Development Boards, Displays, E-Textiles & Crafting, GPS/GNSS, IoT & Wireless, Kits, Robotics, Sensors, Tools and Books and Merch. Featured and Special Categories act as cross-cutting merchandising collections rather than strictly technical families.

The sitemap and category directory are not perfectly identical in presentation. For reliable navigation inventory, retain category names and child relationships from the current HTML directory, and recheck live destination URLs at implementation time.

### 3.3 Selected category hierarchy examples

- **GPS / GNSS:** boards (including high-precision GNSS boards), accessories, antennas, modules, RTK surveyors, global tracking and GNSS timing.
- **Sensors:** biometrics (EMG, fingerprint, pulse/heart), capacitive, current, distance, environmental (air quality, gas, magneto, pressure, seismograph, temperature, weather), flex/force, imaging, infrared, miscellaneous (Vernier), movement (accelerometers, IMU, gyros), NFC, radiation, RFID (antennas, accessories, tags, kits, readers), sensor kits, sound and weight (load cells).
- **Development Boards:** ADC/DAC, cryptographic, development kits, FPGA, logic (mux, shift registers, level shifters), machine learning/AI, microcontrollers (Arduino and accessories/boards/shields; ARM; Python/MicroPython; AVR; PIC; Android; PICAXE; Teensy and accessories/boards/shields), misc dev tools, programmers (including serial/UART and AVR), prototyping boards (protoboard and breadboard), Raspberry Pi (boards, HATs, compute modules, kits and accessories), RTC and single-board computers (micro:bit, Beagle, NVIDIA developer kits/accessories).
- **IoT & Wireless:** Bluetooth, cellular (including cellular antennas/boards), LoRa, mesh, RF, satellite communication, software-defined radio, Wi-Fi, antennas and wireless kits.
- **Components:** buttons/switches (buttons, switches, knobs, keys/keypads), cables (audio, hookup, Qwiic, wire, USB, serial, Ethernet, video), capacitors, connectors (audio, boards, D-Sub, headers, JST, miscellaneous, polarized, power, quick disconnects, registered jacks, sockets, USB, screw/spring terminals), diodes, encoders, ICs (PTH/SMD), LEDs/illumination (addressable, drivers, standard diameters, 7/14-segment and SMD), magnets, oscillators, potentiometers, power (battery, accessories, chargers, voltage, solar, power supply, fuses, relays, wall adapters), resistors, transistors and specialty.
- **Kits:** education, development-board, display, robotics, sensor, tool, wireless, RFID, Raspberry Pi and e-textile kits are exposed as subtypes in category content.
- **Robotics:** hardware, motors, motor drivers, other robotics gear, parts and robotics kits.
- **Tools:** CNC, containers/enclosures, hand tools, instruments, miscellaneous tools, soldering and tool kits.
- **Audio:** audio boards, cables, chips, microphones, miscellaneous audio and speakers.
- **Displays:** LCD, OLED, alphanumeric displays and display kits.
- **E-Textiles & Crafting:** LilyPad, e-textile kits, power, materials/sewable electronics and arts/crafts.
- **Data Logging & Memory:** data loggers, memory and memory cards.
- **Books and Merch:** books and SparkFun swag.
- **Special Categories:** Best Sellers, SparkFun Originals, New Products, SparkX, Ding and Dent, manufacturer/partner collections (for example u-blox, Arm, STMicroelectronics, PJRC, Silicon Labs, NVIDIA, Arduino, Bosch, Septentrio, Digi and Sensirion), Clearance, Qwiic and a price-band collection.

## 4. Homepage structure

Text extraction from the homepage shows multiple editorial and shopping sections, including:

- Global header and site navigation.
- Featured product sections, including category-specific carousels such as Featured IoT & Wireless and Featured Development Boards; visible product cards show title, base price, “As low as” quantity price, availability and Compare/Add to Wish List affordances.
- Additional featured-product carousels for product families.
- “Browse Top Electronics Categories” links, including Environmental Sensors, Displays, Kits, RFID, Audio, Bluetooth, Data Logging, Biometrics and See All Categories.
- “Prototyping and R&D Ecosystems.”
- Latest News, with a See All Latest News link.
- Latest Tutorials and Videos, with Tutorials and Videos tabs and links to all tutorials/videos.
- Popular electronics topics such as Engineering Essentials, Building a GPS System, Working with Wi-Fi, Distance Sensing and RFID Tags & Readers.
- Build a Custom Kit explanatory content and CTA.
- Featured brands.
- A company positioning/story area with Read Our Story.
- A “Get a Quote for” form with privacy consent, customer name, email, phone and comment.
- Newsletter signup and store selector/footer links.

This is an effective content mix for an electronics shop: direct purchase routes and technical learning routes share the same landing page. It has not been visually measured, so this report does not claim exact section order, height or grid sizes beyond the returned text order.

## 5. Category/listing page patterns and variations

### 5.1 Common listing structure

Observed category pages commonly include:

- Page heading and breadcrumb-like taxonomy context (not every extraction exposed the breadcrumb text).
- “Jump to [category] Subcategory” shortcuts with product counts where available.
- Optional descriptive intro copy.
- Category-specific facets exposed as filter buttons/controls.
- Product result count (examples repeatedly show `Items 1-24 of N`).
- Sort choices: Position, Product Name, Price, Newest/Oldest.
- Sort direction control and Items per page selector.
- Product-card rows with title, price, possible “As low as” bulk price, availability, Add to Cart/Backorder/other availability CTA, Compare and Add to Wish List.

A page note explicitly states that choosing sort order or items per page refreshes the page with new results. That is evidence of an intended page-refresh result, but the interaction was not executed by this tool.

### 5.2 Facet variations by category

Filters are not one universal set. Samples show category-specific facets:

- Development Boards / Microcontrollers: Form Factor, Qwiic Connector?, Brands, SparkFun Original.
- Qwiic collection: Product Type, MicroPython libraries, Form Factor, Qwiic Connector?, SparkFun Original.
- GPS / GNSS Boards: GNSS Module options such as ZED-F9P, NEO-M9N and related receiver families.
- GPS / GNSS Antennas: Antenna Type and Mounting Interface (pole, adhesive, magnetic, screw, other), plus Qwiic/brand/original facets.
- Audio: Audio Board Functions (amplifier, microphone, trigger/player, tuner), Qwiic connector, brands and SparkFun Original.
- Movement Sensors: Form Factor, Qwiic Connector and SparkFun Original.
- Robotics: Form Factor, Qwiic Connector, Brands and SparkFun Original.
- Soldering: Brands and SparkFun Original.
- Prototyping Boards: Qwiic Connector, Brands and SparkFun Original.

**Price filter finding (qualified):** an indexed Development Boards URL contains `?price=amshopby_slider_from-amshopby_slider_to`, indicating a price-range filter state/parameter using lower/upper slider tokens. However, the retrieved page text does not expose the actual price filter widget, its labels, min/max values or interaction. Therefore record **URL-state evidence found; visible control/behavior still unverified**. The separate `Items $20 - $30` collection is a curated price-band route and should not be conflated with the filter.

### 5.3 Merchandising/listing variants

- Featured (curated products).
- Best Sellers (20 items in the retrieved snapshot).
- New Products (242 items in the retrieved snapshot).
- SparkFun Originals (broad subset with additional filters).
- Qwiic (cross-category ecosystem listing, with product-type facets).
- Clearance and Today's Deals (discounted/regular prices and campaign rules).
- Special brand/product family collections.
- Deep leaf listings such as Breadboard (16 items in a retrieved snapshot), where there may be no description or only one facet.

### 5.4 Pagination

Category pages commonly show 24 items per page and result counts. A `?page=1` URL is indexed for some category routes; another retrieved URL used `?p=5`. This confirms pagination-related route parameters exist in indexed content, but the actual next/previous control behavior and query parameter semantics have not been tested.

## 6. Product detail patterns and variants

### 6.1 Standard in-stock product pattern

The Qwiic Twist page is a useful detailed baseline:

- Product gallery with “Skip to end/beginning of images gallery” text and product image label.
- Product title and SKU (DEV-15083).
- Short explanatory summary.
- Price and `In stock` status.
- Quantity field bracketed by minus and plus buttons.
- Add to Cart CTA.
- Repeated stock status and Stock/Discounts area.
- Helpful Documentation links: Hookup Guide, Schematic, Datasheet, Register Map.
- Tabs/sections: Overview, Recommended Products, Features & Specs, Documentation, Reviews.
- Related/recommended accessory products.
- Contextual badges/links for Qwiic and MicroPython libraries on this example.
- Bulk-price tiers (10+, 25+, 100+) and a Get in touch for Volume Pricing route.

### 6.2 Specification-rich board/sensor pattern

RedBoard Qwiic and BME280 pages expose structured technical features and documentation. The RedBoard example lists MCU/bootloader, input voltage, clock speed, flash, PWM, analog I/O, UART, I2C and SPI values in a table/list. BME280 provides operating voltage, I2C/SPI, temperature, humidity, pressure and altitude ranges. These pages support a technical comparison and buying decision beyond a marketing paragraph.

### 6.3 Availability and fulfillment states

At least these distinct product states were found:

- **In stock:** typical Add to Cart.
- **Backorder:** a Backorder CTA is presented in category/product content for some unavailable items.
- **Out of stock:** some samples show Notify me when this product is in stock instead of normal purchase availability.
- **Special/discounted price:** some products display a current special price and regular price.
- **Discontinued:** at least one legacy detail route still has product description/specification content but is marked discontinued.
- **Build-to-order:** RTK Express Plus page includes a fulfillment note with a small-quantity lead-time estimate and sales contact.
- **Stock-constrained / no new backorders:** Raspberry Pi 5 product page explains supply constraints and disabled new backorders.

These states require a product-level status model; they should not be reduced to a boolean `inStock` flag.

### 6.4 Product options/variants

No selectable configurable product option/dropdown was positively verified in the sampled product details. The sampled examples included simple SKU product pages, accessories, sensor breakouts, kits and a build-to-order product. Category facets, color-named separate breadboard SKUs and different pack-size products do not prove a single product detail page has selectable variants. A live browser pass should find and test any actual configurable product before an implementation copies that interaction.

### 6.5 Product detail route variation

One older/discontinued page uses a legacy `/catalog/product/view/id/...` URL shape, while current examples use readable slug `.html` routes (some carry store-view query parameters). Account for both canonical and legacy links in audit notes; do not assume all crawled routes share the same URL convention.

## 7. Search, cart, account and checkout

### Search

- Search field is present globally.
- Helper text advertises arrow-key navigation, Enter selection and Escape dismissal in autocomplete.
- SparkFun's privacy policy states that Elasticsearch is used to provide search results for products, blog posts, tutorials, wish lists and other content.
- No search query was executed and autocomplete suggestions were not tested. The direct `/catalogsearch/result/?q=breadboard` URL could not be opened by the available web retrieval tool.

### Cart

- `/checkout/cart` opened and showed an explicit empty-cart state: “You have no items in your shopping cart” and a continue-shopping link.
- This session did not populate a cart, add a product, alter a quantity, remove a line or test persistence.
- No subtotal or checkout CTA was present in the extracted empty-cart state.

### Account

- Login page exposes Registered Customers, email, password, Remember Me, Sign In, Forgot Your Password and New Customers/Create an Account.
- Remember Me helper copy says it can make the shopping cart accessible on the computer even when not signed in; this is descriptive UI copy, not an experimentally confirmed persistence result.
- Registration page shows personal information, newsletter option, remote shopping assistance opt-in, email, password, password-strength indicator and confirm password.

### Checkout

The support hub describes a checkout flow: add items, proceed from cart, sign in or guest checkout, confirm address, choose shipping, tax-exempt flow if applicable, select payment options, apply discount/gift-certificate/purchase-order inputs, review terms/shipping and place order. The `/checkout` entry route could not be opened in this tool, so the steps are documented source content rather than an observed checkout session.

## 8. Support, learning, community and company pages

- **Support:** a long support hub with order placement/status, purchase orders, preorders/backorders, minimum order quantity, gift certificates, changes/cancellations, return policy, shipping, payment, tax, currency conversion, privacy, warranty, terms, holidays, contact and code of conduct topics.
- **FAQ:** account creation, guest checkout, stock/backorder, shipping and order status questions.
- **Contact:** sales/support/technical-assistance routes and a contact form; technical help is directed to the forum.
- **Returns:** 30-day conditions plus return initiation and full guidelines.
- **Documentation:** tutorials, GitHub hookup guides for products released after 2023, legacy/older guides, community forum; product pages also surface documentation.
- **Community forum:** categories for GNSS, development boards, sensors, wireless/IoT, Qwiic, kits, robotics, components/accessories, SparkX, general community and archive.
- **About:** story, values, open source philosophy, community and environmental-impact content.
- **Press & Media:** press releases, logos, Qwiic logos, building/office photos and team/people material.
- **Partner:** distributor/reseller, volume pricing, custom kit and partner-logo sections.
- **Distributors:** map embedded in an iframe; map details were not inspected.
- **News/Learn:** homepage links to news and tutorials/videos; direct page fetch for News and Learn tutorial index returned 403 in this environment, although the search index surfaced tutorial-index information.

## 9. Design system summary — confidence boundaries

### Supported by text and retrieved images

- Product images are served from SparkFun media/catalog paths and a public CDN. SparkFun's privacy policy explicitly mentions Amazon CloudFront for images and other resources.
- Product photographs returned through image search include red SparkFun printed circuit boards/accessories photographed on light/white studio backgrounds. This is not enough to assert all categories use a single image style.
- A documentation callout asset shows a sample price/quantity/Add to Cart area, Helpful Documentation links and tab row; its CTA is teal in that asset. It is an embedded instructional graphic, not a captured current live-page screenshot.
- The brand press page offers downloadable logo variants and Qwiic logos; exact downloadable file URLs and dimensions were not obtained.

### Not measured

No exact CSS color values, typeface, font weight, font-size scale, line height, container width, spacing scale, border radii, shadows, card dimensions, button dimensions, breakpoints or grid column counts are asserted. The browser interface used here is text retrieval and does not expose computed styles or reliable visual viewport rendering.

See `DESIGN_SYSTEM.md` for the evidence ledger and capture checklist.

## 10. Reusable components

The most reusable patterns identified are:

- Global utility header and primary nav.
- Category mega-menu/tree and mobile-nav toggle (actual interaction pending).
- Search/autocomplete overlay.
- Breadcrumb/context navigation.
- Category jump links and filter facets.
- Product toolbar (result count, sort, sort direction, items per page).
- Product cards and availability/price-badge states.
- Product gallery and product purchase panel.
- Quantity stepper and purchase CTA.
- Helpful documentation block and product-detail tabs.
- Specification table/list, review area, volume discount tier list.
- Featured-product carousel.
- Empty cart and checkout journey.
- Login/registration forms.
- Support article/table-of-contents patterns.
- Product quote form and newsletter form.
- Category/resource/tutorial cards and global footer.

Detailed use/variants are in `COMPONENT_INVENTORY.md`.

## 11. Kundu Electronics adaptation implications

The SparkFun reference supports a discovery-first component shop experience. For Kundu, the most important adaptations are not to reproduce SparkFun's full enterprise-scale taxonomy, but to fit the inventory and local buying workflow:

- Use a small number of real top-level categories and useful nested subcategories.
- Provide instant local product search, category filters and a clear BDT price range (the required ৳0–৳200 type of range should be explicit and testable).
- Keep sorting and pagination predictable, especially on mobile.
- Give each product a clear SKU/ID if available, concise summary, image gallery only when multiple genuine images exist, specification list, stock status and accurate selling price.
- Support products with distinct pack size/colour/board revisions as separate SKUs or explicitly model true variants; do not invent options.
- Cart must support quantity changes, remove, computed totals and persistence.
- Checkout must use Kundu's configured manual bKash/Nagad instructions and transaction reference form. SparkFun's card/payment checkout is not a model for Kundu's local manual-payment flow.
- Preserve product documentation/learning links if Kundu has real guides; never fabricate datasheets or manufacturer relationships.
- Use local business details only from confirmed business data; keep missing address, hours, phone, receiving number and policies as explicit placeholders until configured.

## 12. Final status

This is a substantial reference-site text/IA audit, not a complete visual clone specification. The useful public structure has been mapped across 70+ URL records, representative listing/product states and support/company/learning areas. The remaining high-value research is live-browser responsive capture, actual interactions, product-options discovery, populated-cart/checkout testing and CSS/asset metadata inspection. Those limitations are explicit throughout the handoff documents.
