import test from "node:test";
import assert from "node:assert/strict";
import { escapeTelegramHtml, formatTelegramOrderMessage } from "./telegram.ts";

test("Telegram HTML escaping protects customer-provided fields", () => {
  assert.equal(escapeTelegramHtml('<script a="x">&'), "&lt;script a=&quot;x&quot;&gt;&amp;");
});

test("order alert includes essential order/customer/address/totals and admin link", () => {
  const message = formatTelegramOrderMessage({
    orderNumber: "KE-123", customerName: "Ada", customerPhone: "+880123456789",
    customerEmail: "ada@example.test", addressLine: "Road 1", area: "Campus", city: "Khulna",
    deliveryZone: "KUET", orderStatus: "awaiting_payment", stockStatus: "in_stock",
    paymentStatus: "not_submitted", subtotalBdt: 250, deliveryBdt: 60, totalBdt: 310,
    createdAt: "Nov 20, 2026", items: [{ name: "Breadboard", variant: "Full size", sku: "BB-01", quantity: 2, lineTotalBdt: 250 }],
    adminUrl: "https://shop.example/admin/orders",
  });
  for (const expected of ["KE-123", "Ada", "+880123456789", "Road 1", "Khulna", "Breadboard", "৳310", "admin/orders"]) {
    assert.ok(message.includes(expected), `Expected Telegram message to include ${expected}`);
  }
});

test("order notification truncates oversized Telegram messages", () => {
  const message = formatTelegramOrderMessage({
    orderNumber: "KE-999", customerName: "A".repeat(200), customerPhone: "+880123456789",
    addressLine: "X".repeat(1000), city: "Khulna", orderStatus: "awaiting_payment",
    stockStatus: "in_stock", paymentStatus: "not_submitted", subtotalBdt: 100, deliveryBdt: 50, totalBdt: 150,
    createdAt: "now", items: [], adminUrl: "https://shop.example/admin/orders",
  });
  assert.ok(message.length <= 3900);
  assert.ok(message.endsWith("message shortened"));
});
