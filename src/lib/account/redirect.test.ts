import assert from "node:assert/strict";
import test from "node:test";
import { guestOrderIdFromNextPath, safeAccountNextPath } from "./redirect.ts";
test("safe account redirect accepts internal paths only", () => {
 assert.equal(safeAccountNextPath("/account"), "/account");
 assert.equal(safeAccountNextPath("/orders/123"), "/orders/123");
 assert.equal(safeAccountNextPath("https://evil.example"), "/account");
 assert.equal(safeAccountNextPath("//evil.example"), "/account");
 assert.equal(safeAccountNextPath("/\\\\evil.example"), "/account");
 assert.equal(safeAccountNextPath(null), "/account");
});
test("only exact order-status path yields a guest-order claim id", () => {
 const id = "123e4567-e89b-12d3-a456-426614174000";
 assert.equal(guestOrderIdFromNextPath(`/orders/${id}`), id);
 assert.equal(guestOrderIdFromNextPath(`/orders/${id}/review`), null);
 assert.equal(guestOrderIdFromNextPath("/orders/not-an-id"), null);
 assert.equal(guestOrderIdFromNextPath("//orders/" + id), null);
});