import assert from "node:assert/strict";
import test from "node:test";
import { parsePublicPaymentMethods } from "./payment-methods.ts";

test("public payment configuration accepts only configured bKash and Nagad methods", () => {
  assert.deepEqual(parsePublicPaymentMethods([
    { method: "bkash", receivingNumber: "01500000000", instructions: "Send Money" },
    { method: "nagad", receivingNumber: "01600000000", instructions: "Send Money" },
    { method: "rocket", receivingNumber: "01700000000", instructions: "Unsupported" },
  ]), [
    { method: "bkash", receivingNumber: "01500000000", instructions: "Send Money" },
    { method: "nagad", receivingNumber: "01600000000", instructions: "Send Money" },
  ]);
});

test("public payment configuration safely rejects malformed and incomplete entries", () => {
  assert.deepEqual(parsePublicPaymentMethods([
    null,
    "bkash",
    [],
    {},
    { method: "bkash", receivingNumber: "", instructions: "Send Money" },
    { method: "nagad", receivingNumber: "01600000000", instructions: " " },
  ]), []);
  assert.deepEqual(parsePublicPaymentMethods({ method: "bkash" }), []);
});
