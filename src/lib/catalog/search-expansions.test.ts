import test from "node:test";
import assert from "node:assert/strict";
import { getRelatedCatalogSearchTerms } from "./search-expansions.ts";

test("expands a single-letter b search to include Breadboard matches", () => {
  assert.deepEqual(getRelatedCatalogSearchTerms("b"), ["breadboard"]);
  assert.deepEqual(getRelatedCatalogSearchTerms(" B "), ["breadboard"]);
});

test("does not expand normal multi-character searches", () => {
  assert.deepEqual(getRelatedCatalogSearchTerms("bread"), []);
  assert.deepEqual(getRelatedCatalogSearchTerms("arduino"), []);
  assert.deepEqual(getRelatedCatalogSearchTerms(""), []);
});
