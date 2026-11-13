"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { formatPriceBdt } from "@/lib/format";
import type { PublicCheckoutConfig } from "@/data/storefront";
import { parseOrderSummary, type OrderSummary } from "@/lib/orders/order-summary";

const orderStatusLabel: Record<string, string> = {
  pending_stock_confirmation: "Waiting for stock confirmation",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const orderLoadFailure = "This order could not be loaded. Open the order from the same browser where checkout was completed, or contact the shop with your order number.";

type OrderLoadState =
  | { orderId: string; status: "success"; order: OrderSummary }
  | { orderId: string; status: "error"; message: string };

async function requestOrderSummary(orderId: string, signal?: AbortSignal): Promise<OrderSummary> {
  const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store", signal });
  const payload: unknown = await response.json();
  const order = parseOrderSummary(payload);
  if (!response.ok || !order) throw new Error("Order could not be found.");
  return order;
}

export function OrderConfirmationClient({ orderId, checkout }: { orderId: string; checkout: PublicCheckoutConfig }) {
  const [orderLoad, setOrderLoad] = useState<OrderLoadState | null>(null);
  const requestSequence = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const currentOrderLoad = orderLoad?.orderId === orderId ? orderLoad : null;
  const order = currentOrderLoad?.status === "success" ? currentOrderLoad.order : null;
  const loadError = currentOrderLoad?.status === "error" ? currentOrderLoad.message : "";
  const loading = currentOrderLoad === null;
  const [method, setMethod] = useState<"bkash" | "nagad">(checkout.paymentMethods[0]?.method ?? "bkash");
  const [senderPhone, setSenderPhone] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const idempotency = useRef<{ signature: string; key: string } | null>(null);

  const refreshOrder = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const sequence = ++requestSequence.current;
    try {
      const refreshedOrder = await requestOrderSummary(orderId, controller.signal);
      if (!controller.signal.aborted && sequence === requestSequence.current) {
        setOrderLoad({ orderId, status: "success", order: refreshedOrder });
      }
    } catch {
      if (!controller.signal.aborted && sequence === requestSequence.current) {
        setOrderLoad({ orderId, status: "error", message: orderLoadFailure });
      }
    }
  }, [orderId]);

  useEffect(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const sequence = ++requestSequence.current;

    void requestOrderSummary(orderId, controller.signal).then(
      (loadedOrder) => {
        if (!controller.signal.aborted && sequence === requestSequence.current) {
          setOrderLoad({ orderId, status: "success", order: loadedOrder });
        }
      },
      () => {
        if (!controller.signal.aborted && sequence === requestSequence.current) {
          setOrderLoad({ orderId, status: "error", message: orderLoadFailure });
        }
      },
    );

    return () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
      if (sequence === requestSequence.current) requestSequence.current += 1;
    };
  }, [orderId]);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    setError("");
    setMessage("");
    const payload = { method, senderPhone: senderPhone.trim(), transactionReference: transactionReference.trim() };
    const signature = JSON.stringify(payload);
    const digestBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
    const signatureDigest = Array.from(new Uint8Array(digestBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const storageKey = `ke-payment-idempotency-v1:${orderId}`;
    let stored: { signature: string; key: string } | null = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      stored = raw ? JSON.parse(raw) as { signature: string; key: string } : null;
    } catch { stored = null; }
    if (stored?.signature === signatureDigest && /^[0-9a-f-]{36}$/i.test(stored.key)) {
      idempotency.current = stored;
    } else if (!idempotency.current || idempotency.current.signature !== signatureDigest) {
      idempotency.current = { signature: signatureDigest, key: crypto.randomUUID() };
    }
    try { sessionStorage.setItem(storageKey, JSON.stringify(idempotency.current)); } catch { /* The request still has in-memory retry protection. */ }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...payload, idempotencyKey: idempotency.current.key }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "Payment reference could not be submitted.");
        return;
      }
      setMessage(result.message ?? "Payment details submitted. Verification is still pending.");
      try { sessionStorage.removeItem(storageKey); } catch { /* Ignore unavailable browser storage. */ }
      idempotency.current = null;
      await refreshOrder();
    } catch {
      setError("A network error occurred. Retry the same reference to safely reuse its idempotency key.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className="order-state"><p>Loading order…</p></section>;
  if (loadError || !order) return <section className="notice-panel"><strong>Order unavailable</strong><p>{loadError || "Order not found."}</p></section>;

  const selectedMethod = checkout.paymentMethods.find((item) => item.method === method);
  const canSubmitPayment = order.orderStatus === "awaiting_payment"
    && !["pending_verification", "verified", "refunded"].includes(order.paymentStatus);

  return (
    <div className="order-confirmation">
      <section className="order-summary-panel">
        <span className="section-kicker">ORDER {order.orderNumber}</span>
        <h2>{orderStatusLabel[order.orderStatus] ?? order.orderStatus.replaceAll("_", " ")}</h2>
        <p>Thank you, {order.customerName}. Your order record has been saved.</p>
        <div className="order-status-grid">
          <div><span>Order status</span><strong>{orderStatusLabel[order.orderStatus] ?? order.orderStatus}</strong></div>
          <div><span>Payment status</span><strong>{order.paymentStatus.replaceAll("_", " ")}</strong></div>
          <div><span>Delivery area</span><strong>{order.deliveryZone}, {order.deliveryCity}</strong></div>
          <div><span>Fulfilment</span><strong>{order.fulfilmentStatus.replaceAll("_", " ")}</strong></div>
        </div>
        <div className="order-line-list">
          {order.items.map((item, index) => <div className="order-line" key={`${item.sku ?? item.name}-${index}`}>
            <span>{item.name}{item.variant ? ` · ${item.variant}` : ""} × {item.quantity}</span>
            <strong>{formatPriceBdt(item.lineTotalBdt)}</strong>
          </div>)}
        </div>
        <div className="cart-summary-total"><span>Subtotal</span><strong>{formatPriceBdt(order.subtotalBdt)}</strong></div>
        <div className="cart-summary-total"><span>Delivery</span><strong>{formatPriceBdt(order.deliveryChargeBdt)}</strong></div>
        <div className="cart-summary-total"><span>Order total</span><strong>{formatPriceBdt(order.totalBdt)}</strong></div>
        <button className="text-button" type="button" onClick={() => void refreshOrder()}>Refresh order status</button>
      </section>

      {order.orderStatus === "pending_stock_confirmation" ? (
        <section className="notice-panel"><strong>Stock confirmation is pending</strong><p>The shop must confirm availability before payment can be submitted. No payment is due yet.</p></section>
      ) : null}

      {order.paymentStatus === "pending_verification" ? (
        <section className="notice-panel payment-pending"><strong>Payment details received — verification pending</strong><p>Your transaction reference has been recorded. The order is not marked as paid until an authorized shop administrator verifies the transfer.</p></section>
      ) : null}
      {order.paymentStatus === "verified" ? (
        <section className="notice-panel payment-verified"><strong>Payment verified</strong><p>The shop has verified the submitted transaction. Fulfilment status will update separately.</p></section>
      ) : null}
      {order.paymentStatus === "rejected" ? (
        <section className="notice-panel"><strong>Payment submission rejected</strong><p>{order.payment?.rejectionReason || "The payment reference was not accepted. Contact the shop for clarification before submitting another reference."}</p></section>
      ) : null}

      {canSubmitPayment ? (
        <section className="checkout-section">
          <span className="section-kicker">MANUAL PAYMENT</span>
          <h2>Pay {formatPriceBdt(order.totalBdt)}</h2>
          {checkout.paymentMethods.length === 0 ? <div className="notice-panel"><p>Payment methods are not configured. Contact the shop before transferring money.</p></div> : (
            <form className="checkout-form" onSubmit={submitPayment}>
              <label>Payment method<select value={method} onChange={(event) => { setMethod(event.target.value as "bkash" | "nagad"); idempotency.current = null; }}>
                {checkout.paymentMethods.map((item) => <option key={item.method} value={item.method}>{item.method === "bkash" ? "bKash" : "Nagad"}</option>)}
              </select></label>
              {selectedMethod ? <div className="payment-instructions"><strong>Send Money to {selectedMethod.method === "bkash" ? "bKash" : "Nagad"}</strong><p className="receiving-number">{selectedMethod.receivingNumber}</p><p>{selectedMethod.instructions}</p><p>Exact amount: <strong>{formatPriceBdt(order.totalBdt)}</strong></p></div> : null}
              <label>Sender phone number<input required type="tel" maxLength={32} value={senderPhone} onChange={(event) => { setSenderPhone(event.target.value); idempotency.current = null; }} /></label>
              <label>Transaction reference / TrxID<input required minLength={4} maxLength={100} value={transactionReference} onChange={(event) => { setTransactionReference(event.target.value); idempotency.current = null; }} /></label>
              {error ? <p role="alert" className="form-error">{error}</p> : null}
              {message ? <p role="status" className="form-success">{message}</p> : null}
              <button type="submit" className="button button-primary" disabled={submitting || !selectedMethod}>{submitting ? "Submitting…" : "Submit transaction reference"}</button>
              <p className="checkout-disclaimer">Submitting a transaction reference does not verify payment. Your order remains pending until the shop checks the transfer.</p>
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}
