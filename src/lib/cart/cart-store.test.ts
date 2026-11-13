import assert from "node:assert/strict";
import test from "node:test";
import { createCartStore, parseStoredCart } from "./cart-store.ts";

const productId = "123e4567-e89b-42d3-a456-426614174000";
const variantId = "123e4567-e89b-42d3-a456-426614174001";

test("cart storage restores valid product and variant quantities", () => {
  assert.deepEqual(parseStoredCart(JSON.stringify([
    { productId, variantId, quantity: 2 },
    { productId, variantId: null, quantity: 1 },
  ])), [
    { productId, variantId, quantity: 2 },
    { productId, variantId: null, quantity: 1 },
  ]);
});

test("cart storage discards invalid identifiers and quantities", () => {
  assert.deepEqual(parseStoredCart(JSON.stringify([
    { productId: "not-a-uuid", variantId: null, quantity: 1 },
    { productId, variantId: "not-a-uuid", quantity: 1 },
    { productId, variantId: null, quantity: 0 },
    { productId, variantId: null, quantity: 100 },
  ])), []);
});

test("cart storage handles malformed or missing content", () => {
  assert.deepEqual(parseStoredCart("{"), []);
  assert.deepEqual(parseStoredCart("null"), []);
  assert.deepEqual(parseStoredCart(null), []);
});

test("in-memory cart remains usable when localStorage writes are blocked", () => {
  const stored: string | null = null;
  const store = createCartStore(() => ({
    getItem: () => stored,
    setItem: () => { throw new Error("storage quota exceeded"); },
  }));

  store.update(() => [{ productId, variantId: null, quantity: 2 }]);
  assert.deepEqual(store.getSnapshot(), [{ productId, variantId: null, quantity: 2 }]);
  store.update((current) => current.map((line) => ({ ...line, quantity: line.quantity + 1 })));
  assert.deepEqual(store.getSnapshot(), [{ productId, variantId: null, quantity: 3 }]);
});


test("cart store hydrates its initial snapshot from persisted storage", () => {
  const stored = JSON.stringify([{ productId, variantId, quantity: 4 }]);
  const store = createCartStore(() => ({
    getItem: () => stored,
    setItem: () => undefined,
  }));

  assert.deepEqual(store.getSnapshot(), [{ productId, variantId, quantity: 4 }]);
});

test("cart store persists updates using the canonical storage key", () => {
  let stored: string | null = null;
  const store = createCartStore(() => ({
    getItem: () => stored,
    setItem: (_key, value) => { stored = value; },
  }));

  store.update(() => [{ productId, variantId: null, quantity: 3 }]);

  assert.equal(stored, JSON.stringify([{ productId, variantId: null, quantity: 3 }]));
});
