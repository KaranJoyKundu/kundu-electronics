import assert from "node:assert/strict";
import test from "node:test";
import { parseCatalogSearchRows } from "./catalog-search.ts";

const validRow = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  slug: "mini-breadboard",
  name: "Mini Breadboard",
  sku: "BRD-001",
  brand: null,
  short_description: "400-point solderless breadboard",
  price_bdt: "110",
  public_availability: "unknown",
  category_slug: "prototyping",
  primary_image_path: null,
};

test("catalogue RPC payload parses safe PostgreSQL bigint strings", () => {
  assert.deepEqual(parseCatalogSearchRows([validRow]), [{ ...validRow, price_bdt: 110 }]);
});

test("catalogue RPC parser rejects malformed and unsafe rows", () => {
  assert.deepEqual(parseCatalogSearchRows([
    validRow,
    { ...validRow, price_bdt: "not-a-price" },
    { ...validRow, public_availability: "available-ish" },
    null,
  ]), [{ ...validRow, price_bdt: 110 }]);
  assert.deepEqual(parseCatalogSearchRows({ rows: [validRow] }), []);
});
