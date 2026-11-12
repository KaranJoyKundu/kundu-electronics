import test from "node:test";
import assert from "node:assert/strict";
import { filterProducts, searchProducts } from "./search.ts";
import type { Product } from "./types.ts";

const fixture: Product[] = [
  {
    id: "fixture-1", sku: "BRD-001", slug: "breadboard", name: "Breadboard 830 Point",
    priceBdt: 150, categorySlug: "prototyping", availability: "in_stock", images: [],
    published: true, updatedAt: "2026-11-13",
  },
  {
    id: "fixture-2", sku: "LED-001", slug: "red-led", name: "Red LED 5mm",
    priceBdt: 10, categorySlug: "components", availability: "in_stock", images: [],
    published: true, updatedAt: "2026-11-13",
  },
  {
    id: "fixture-3", sku: "HIDDEN-1", slug: "draft-board", name: "Draft Breadboard",
    priceBdt: 99, categorySlug: "prototyping", availability: "in_stock", images: [],
    published: false, updatedAt: "2026-11-13",
  },
];

test("single-character partial search surfaces Breadboard when present", () => {
  assert.deepEqual(searchProducts(fixture, "b").map((item) => item.slug), ["breadboard"]);
});

test("search is case insensitive and trims whitespace", () => {
  assert.equal(searchProducts(fixture, "  BREAD  ").length, 1);
});

test("draft products are never returned in public search", () => {
  assert.equal(searchProducts(fixture, "draft").length, 0);
});

test("price and category filters combine inclusively", () => {
  const result = filterProducts(fixture, {
    categorySlug: "prototyping", minPrice: 0, maxPrice: 200,
  });
  assert.deepEqual(result.map((item) => item.slug), ["breadboard"]);
});

test("sorts prices ascending when requested", () => {
  const result = filterProducts(fixture, { sort: "price-asc" });
  assert.deepEqual(result.map((item) => item.slug), ["red-led", "breadboard"]);
});

test("empty search returns no autocomplete suggestions", () => {
  assert.equal(searchProducts(fixture, "   ").length, 0);
});
