import assert from "node:assert/strict";
import test from "node:test";
import { parseOrderSummary } from "./order-summary.ts";

const validOrder = {
  order: {
    orderId: "order-1",
    orderNumber: "KE-2026-0001",
    customerName: "Test customer",
    deliveryZone: "Khulna",
    deliveryCity: "Khulna",
    orderStatus: "awaiting_payment",
    stockStatus: "reserved",
    paymentStatus: "not_submitted",
    paymentPreference: "online_payment",
    fulfilmentStatus: "unfulfilled",
    subtotalBdt: 500,
    deliveryChargeBdt: 60,
    totalBdt: 560,
    createdAt: "2026-11-13T00:00:00.000Z",
    items: [{ sku: "TEST-1", name: "Test item", variant: null, unitPriceBdt: 500, quantity: 1, lineTotalBdt: 500 }],
    payment: null,
  },
};

test("order summary parser accepts valid order snapshots and payment rejection details", () => {
  const parsed = parseOrderSummary({
    order: {
      ...validOrder.order,
      payment: { method: "bkash", status: "rejected", submittedAt: "2026-11-13T00:00:00.000Z", rejectionReason: "Reference not found" },
    },
  });
  assert.equal(parsed?.payment?.method, "bkash");
  assert.equal(parsed?.payment?.rejectionReason, "Reference not found");
});

test("order summary parser accepts nullable legacy payment preference and COD", () => {
  assert.equal(parseOrderSummary({ order: { ...validOrder.order, paymentPreference: "cash_on_delivery" } })?.paymentPreference, "cash_on_delivery");
  assert.equal(parseOrderSummary({ order: { ...validOrder.order, paymentPreference: null } })?.paymentPreference, null);
  assert.equal(parseOrderSummary({ order: { ...validOrder.order, paymentPreference: "unsupported" } }), null);
});

test("order summary parser rejects unsafe amounts, unsupported payment methods and malformed lines", () => {
  assert.equal(parseOrderSummary(null), null);
  assert.equal(parseOrderSummary({ order: { ...validOrder.order, totalBdt: 5.5 } }), null);
  assert.equal(parseOrderSummary({
    order: {
      ...validOrder.order,
      payment: { method: "rocket", status: "pending", submittedAt: "2026-11-13T00:00:00.000Z" },
    },
  }), null);
  assert.equal(parseOrderSummary({
    order: { ...validOrder.order, items: [{ ...validOrder.order.items[0], quantity: 0 }] },
  }), null);
});
