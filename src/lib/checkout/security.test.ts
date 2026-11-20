import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalizeCheckoutPayload,
  createCheckoutCredentials,
  hashGuestOrderAccessToken,
  isUuid,
  parseHmacSecret,
  safeTokenEquals,
  type CheckoutIdentityPayload,
} from "./security.ts";

const secretHex = "0123456789abcdef".repeat(4);
const secret = parseHmacSecret(secretHex);
const payload: CheckoutIdentityPayload = {
  customer: {
    name: "Test Customer", phone: "+8801700000000", email: null,
    addressLine1: "Test address", addressLine2: null, area: null,
    city: "Khulna", postalCode: null, note: null,
  },
  items: [
    { productId: "11111111-1111-4111-8111-111111111111", variantId: null, quantity: 2 },
    { productId: "22222222-2222-4222-8222-222222222222", variantId: "33333333-3333-4333-8333-333333333333", quantity: 1 },
  ],
  deliveryZoneId: "44444444-4444-4444-8444-444444444444",
  paymentPreference: "online_payment",
};

test("HMAC secret requires exactly 32 bytes of hexadecimal material", () => {
  assert.equal(parseHmacSecret(undefined), null);
  assert.equal(parseHmacSecret("not-a-secret"), null);
  assert.equal(parseHmacSecret(secretHex)?.byteLength, 32);
});

test("checkout canonicalization is independent of cart item order", () => {
  const reversed = { ...payload, items: [...payload.items].reverse() };
  assert.equal(canonicalizeCheckoutPayload(payload), canonicalizeCheckoutPayload(reversed));
});

test("same idempotent checkout produces stable private guest credentials", () => {
  assert.ok(secret);
  const first = createCheckoutCredentials(secret, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", payload);
  const second = createCheckoutCredentials(secret, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", payload);
  assert.deepEqual(first, second);
  assert.equal(hashGuestOrderAccessToken(secret, first.accessToken), first.accessTokenHash);
  assert.equal(safeTokenEquals(first.accessTokenHash, second.accessTokenHash), true);
});

test("changed checkout data changes the fingerprint and order access token", () => {
  assert.ok(secret);
  const changed = { ...payload, customer: { ...payload.customer, city: "Dhaka" } };
  const first = createCheckoutCredentials(secret, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", payload);
  const second = createCheckoutCredentials(secret, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", changed);
  assert.notEqual(first.fingerprint, second.fingerprint);
  assert.notEqual(first.accessToken, second.accessToken);
  const cod = { ...payload, paymentPreference: "cash_on_delivery" as const };
  const third = createCheckoutCredentials(secret, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", cod);
  assert.notEqual(first.fingerprint, third.fingerprint);
});

test("UUID validation rejects malformed identifiers", () => {
  assert.equal(isUuid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"), true);
  assert.equal(isUuid("not-a-uuid"), false);
  assert.equal(isUuid(null), false);
});
