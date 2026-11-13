import assert from "node:assert/strict";
import test from "node:test";
import { parseCatalogProductsQuery } from "./query.ts";

function parse(query = ""): ReturnType<typeof parseCatalogProductsQuery> {
  return parseCatalogProductsQuery(new URLSearchParams(query));
}

test("catalogue API query defaults and preserves the zero-to-200 price range", () => {
  assert.deepEqual(parse("query=%20bread%20&category=prototyping&min=0&max=200"), {
    ok: true,
    value: { query: "bread", category: "prototyping", minPrice: 0, maxPrice: 200, sort: "relevance", page: 1 },
  });
});

test("catalogue API query accepts supported sorting and bounded pagination", () => {
  const result = parse("sort=price-desc&page=12");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.sort, "price-desc");
    assert.equal(result.value.page, 12);
  }
});

test("catalogue API query rejects malformed or reversed price ranges", () => {
  assert.equal(parse("min=-1").ok, false);
  assert.equal(parse("min=1.5").ok, false);
  assert.equal(parse("min=201&max=200").ok, false);
  assert.equal(parse("max=99999999999").ok, false);
});

test("catalogue API query rejects unsafe categories, controls, sorts and pages", () => {
  assert.equal(parse("category=../private").ok, false);
  assert.equal(parse("query=%00").ok, false);
  assert.equal(parse("sort=unknown").ok, false);
  assert.equal(parse("page=0").ok, false);
  assert.equal(parse("page=401").ok, false);
});
