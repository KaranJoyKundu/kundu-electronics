import test from "node:test";
import assert from "node:assert/strict";
import { parseCheckoutBody, parsePaymentSubmissionBody } from "./validation.ts";

const ids = {
  idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  deliveryZoneId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  productId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  variantId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
};

const validCheckout = {
  idempotencyKey: ids.idempotencyKey,
  deliveryZoneId: ids.deliveryZoneId,
  paymentPreference: "online_payment",
  customer: {
    name: "Test Buyer", phone: "+880 1700-000000", email: "buyer@example.com",
    addressLine1: "KUET campus", city: "Khulna",
  },
  items: [{ productId: ids.productId, quantity: 2 }],
};

test("checkout validation normalizes optional fields and accepts a valid guest order", () => {
  const result = parseCheckoutBody(validCheckout);
  assert.ok(result);
  assert.equal(result.payload.customer.area, null);
  assert.equal(result.payload.customer.note, null);
  assert.equal(result.payload.items[0]?.quantity, 2);
  assert.equal(result.payload.paymentPreference, "online_payment");
});

test("checkout validation merges duplicate product and variant lines", () => {
  const result = parseCheckoutBody({
    ...validCheckout,
    items: [
      { productId: ids.productId, quantity: 2 },
      { productId: ids.productId, quantity: 3 },
      { productId: ids.productId, variantId: ids.variantId, quantity: 1 },
    ],
  });
  assert.ok(result);
  assert.equal(result.payload.items.length, 2);
  assert.equal(result.payload.items.find((item) => item.variantId === null)?.quantity, 5);
});

test("checkout rejects invalid identity, address, prices-as-quantities and out-of-range quantities", () => {
  assert.equal(parseCheckoutBody({ ...validCheckout, deliveryZoneId: "bad" }), null);
  assert.equal(parseCheckoutBody({ ...validCheckout, customer: { ...validCheckout.customer, email: "invalid" } }), null);
  assert.equal(parseCheckoutBody({ ...validCheckout, items: [{ productId: ids.productId, quantity: 0 }] }), null);
  assert.equal(parseCheckoutBody({ ...validCheckout, items: [{ productId: ids.productId, quantity: 100 }] }), null);
  assert.equal(parseCheckoutBody({ ...validCheckout, items: [{ productId: ids.productId, quantity: 50 }, { productId: ids.productId, quantity: 50 }] }), null);
});

test("checkout accepts COD and rejects unsupported payment preferences", () => {
  assert.equal(parseCheckoutBody({ ...validCheckout, paymentPreference: "cash_on_delivery" })?.payload.paymentPreference, "cash_on_delivery");
  assert.equal(parseCheckoutBody({ ...validCheckout, paymentPreference: "rocket" }), null);
  const legacy = { ...validCheckout }; delete (legacy as { paymentPreference?: string }).paymentPreference;
  assert.equal(parseCheckoutBody(legacy)?.payload.paymentPreference, "online_payment");
});

test("checkout rejects an empty cart and more than forty lines", () => {
  assert.equal(parseCheckoutBody({ ...validCheckout, items: [] }), null);
  assert.equal(parseCheckoutBody({ ...validCheckout, items: Array.from({ length: 41 }, (_, index) => ({
    productId: `${String(index + 1).padStart(8, "0")}-aaaa-4aaa-8aaa-aaaaaaaaaaaa`, quantity: 1,
  })) }), null);
});

test("checkout accepts structured reference/suggestion notes within the expanded bound", () => {
  const withinLimit = parseCheckoutBody({
    ...validCheckout,
    customer: { ...validCheckout.customer, note: "Reference: KUET\nSuggestions: " + "x".repeat(1_350) },
  });
  assert.ok(withinLimit);
  assert.equal(parseCheckoutBody({
    ...validCheckout,
    customer: { ...validCheckout.customer, note: "x".repeat(1_401) },
  }), null);
});

test("payment validation accepts only bKash/Nagad and bounded sender/reference fields", () => {
  const valid = parsePaymentSubmissionBody({
    idempotencyKey: ids.idempotencyKey, method: "bkash", senderPhone: "+8801700000000", transactionReference: "TXN-123456",
  });
  assert.equal(valid?.method, "bkash");
  assert.equal(parsePaymentSubmissionBody({
    idempotencyKey: ids.idempotencyKey, method: "rocket", senderPhone: "+8801700000000", transactionReference: "TXN-123456",
  }), null);
  assert.equal(parsePaymentSubmissionBody({
    idempotencyKey: ids.idempotencyKey, method: "nagad", senderPhone: "bad", transactionReference: "TXN-123456",
  }), null);
  assert.equal(parsePaymentSubmissionBody({
    idempotencyKey: ids.idempotencyKey, method: "nagad", senderPhone: "+8801700000000", transactionReference: "x",
  }), null);
});
