# Project Kits, Founder Story and Checkout

Updated: 18 November 2026 (Asia/Dhaka)

## Robot packages and source totals

The kit BOM, names, quantities and estimated package totals are based on the owner-supplied robot_selling_price_list_2(1).md.

| Project | Tier 1 estimated cost | Tier 2 estimated cost | Tier 3 estimated cost |
|---|---:|---:|---:|
| Line Following Robot | ৳4,999 — Entry / Participation Build | ৳7,499 — Competitive Build | ৳9,999 — Elite Winner Build |
| Soccer Bot | ৳3,999 — Budget Scrapper | ৳9,999 — Precision Striker | ৳14,999 — Optimized Juggernaut |
| RC Speed Battle | ৳3,999 — The Scrapper | ৳9,999 — The Striker | ৳16,999 — The Juggernaut |

Database bundle identifiers are LFR-T1–T3, SB-T1–T3 and RC-T1–T3. They are bundle IDs created for the website, not individual component catalogue SKUs. BOM component P-codes appear only when there was an exact match to an existing catalogue item. Similar component variants are not substituted silently. Items without an exact match remain named as specified in the uploaded BOM.

All nine bundle products are published as build-to-order and use untracked inventory. Customers can pre-order them now at the listed website price. The next stock drop is expected in 7–14 days, so a pre-order reserves a kit from that drop. The existing stock-arrival action is used internally when the items arrive; it then unlocks online payment.

## Resistor listings

P091 — 1kΩ Resistor Box 5000pcs — remains published at its pre-existing price of ৳1. All other 12 products with “resistor” in their name, including the extra 5W resistor filed under Passive Components & Misc, are archived and marked discontinued. They were not deleted, preserving old order references and audit history.

## Delivery and checkout

- Standard delivery: 12 hours–1 day, ৳0.
- Urgent delivery: 30–60 minutes, ৳50.
- These are speed choices; the customer enters an address, and the shop confirms the delivery window can be achieved.
- Website checkout creates an order using the existing create_checkout_order RPC. The database recalculates current product prices and delivery charges and maintains idempotency and stock-lock behaviour.
- Project-kit pre-orders are accepted immediately at the listed website price. The next stock drop is expected in 7–14 days; no separate customer-facing final-price confirmation is needed to reserve a kit.
- Website checkout offers Cash on delivery and Online payment. bKash and Nagad use the configured owner-provided number 01735530174. Online payment for pre-orders becomes available when the stock arrives; in-stock-only items can be paid immediately. A submitted TrxID remains pending until an authorized admin verifies it.
- The WhatsApp message lists one line per product: product code - product name - unit price x quantity - line total. It includes delivery charge and a final Total: line. Phone ordering is also available.

## Founder story and project showcases

The About the Founder page uses the account supplied by Karan Joy Kundu (ECE '24, KUET): he began sourcing and supplying components locally after struggling to find common lab and hobby project parts near campus, often having to travel to Dhaka or wait for online delivery.

The homepage carousel shows Bee Biped Robot, LFR, Soccer Bot, RC Speed Battle and Drone Enquiry, moving horizontally every three seconds. The Bee Biped Robot project is linked to https://github.com/KaranJoyKundu/bee-biped-robot. The repository did not contain tracked project photos when inspected, so its display uses a labelled original vector illustration rather than unrelated stock imagery.

The supplied robot price list contains no drone bill of materials or price. Drone is therefore an enquiry card, not a purchasable priced kit.
