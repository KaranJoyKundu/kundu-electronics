import assert from "node:assert/strict";
import test from "node:test";
import { parseReviewSubmission } from "./review-validation.ts";

test("review submission parser accepts star-only and optional display name", () => {
  assert.deepEqual(parseReviewSubmission({ rating: 5 }), { rating: 5, reviewText: null, displayName: null });
  assert.deepEqual(parseReviewSubmission({ rating: 4, reviewText: "  Nice shop  ", displayName: "  Ada " }),
    { rating: 4, reviewText: "Nice shop", displayName: "Ada" });
});

test("review submission parser rejects invalid ratings and non-object payloads", () => {
  for (const value of [null, [], "review", { rating: 0 }, { rating: 6 }, { rating: 4.5 }, { rating: "5" }]) {
    assert.equal(parseReviewSubmission(value), null);
  }
});

test("review submission parser rejects wrong field types and overlong text", () => {
  assert.equal(parseReviewSubmission({ rating: 5, reviewText: 123 }), null);
  assert.equal(parseReviewSubmission({ rating: 5, displayName: false }), null);
  assert.equal(parseReviewSubmission({ rating: 5, reviewText: "x".repeat(1001) }), null);
  assert.equal(parseReviewSubmission({ rating: 5, displayName: "x".repeat(81) }), null);
});
