import test from "node:test";
import assert from "node:assert/strict";
import { resolveCartLinePrice } from "./cart-pricing.ts";
import type { ProductVariant } from "@/lib/catalog/types";

const variants: ProductVariant[] = [
  { id: "variant-a", sku: "A", name: "Standard", optionValues: { colour: "Black" }, priceOverrideBdt: null },
  { id: "variant-b", sku: "B", name: "Premium", optionValues: { colour: "Red" }, priceOverrideBdt: 750 },
];

test("uses base price for products without variants", () => {
  assert.deepEqual(resolveCartLinePrice(500), { valid: true, priceBdt: 500, variant: null });
});

test("requires a selected option when active variants exist", () => {
  assert.equal(resolveCartLinePrice(500, variants).valid, false);
});

test("uses the selected variant price override", () => {
  const result = resolveCartLinePrice(500, variants, "variant-b");
  assert.equal(result.valid, true);
  assert.equal(result.priceBdt, 750);
  assert.equal(result.variant?.name, "Premium");
});

test("uses base product price when selected variant has no override", () => {
  assert.equal(resolveCartLinePrice(500, variants, "variant-a").priceBdt, 500);
});

test("rejects variants not present in the current catalogue response", () => {
  assert.equal(resolveCartLinePrice(500, variants, "variant-deleted").valid, false);
});
