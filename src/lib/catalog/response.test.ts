import assert from "node:assert/strict";
import test from "node:test";
import { parseCartProducts, parseSearchSuggestions } from "./response.ts";

const productId = "123e4567-e89b-42d3-a456-426614174000";
const variantId = "123e4567-e89b-42d3-a456-426614174001";

const product = {
  id: productId,
  sku: "BRD-001",
  slug: "mini-breadboard",
  name: "Mini Breadboard",
  summary: "400-point solderless board",
  description: "A customer-facing description.",
  priceBdt: 110,
  categorySlug: "prototyping",
  availability: "unknown",
  images: [{ src: "https://example.invalid/image.webp", alt: "Breadboard" }],
  variants: [{ id: variantId, sku: null, name: "White", optionValues: { colour: "White" }, priceOverrideBdt: null }],
  published: true,
  orderable: false,
  updatedAt: "2026-11-13T00:00:00.000Z",
};

test("cart response accepts well-formed published products and variants", () => {
  assert.deepEqual(parseCartProducts({ products: [product] }), [product]);
});

test("cart response rejects malformed identifiers, prices, variants and images", () => {
  assert.deepEqual(parseCartProducts({ products: [
    { ...product, id: "not-a-uuid" },
    { ...product, priceBdt: 1.5 },
    { ...product, variants: [{ ...product.variants[0], id: "bad-id" }] },
    { ...product, images: [{ src: "", alt: 3 }] },
  ] }), []);
});

test("search response only exposes validated suggestion fields", () => {
  const valid = { id: productId, slug: "mini-breadboard", name: "Mini Breadboard", sku: "BRD-001", category: "prototyping" };
  assert.deepEqual(parseSearchSuggestions({ products: [valid, { ...valid, id: "bad" }, null] }), [valid]);
  assert.deepEqual(parseSearchSuggestions({ products: "not an array" }), []);
});
