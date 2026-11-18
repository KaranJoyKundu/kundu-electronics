"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import type { PublicCheckoutConfig } from "@/data/storefront";
import { useCart } from "@/components/cart/cart-provider";
import { formatPriceBdt } from "@/lib/format";
import { resolveCartLinePrice } from "@/lib/catalog/cart-pricing";
import { parseCartProducts } from "@/lib/catalog/response";
import { business } from "@/config/business";

interface ProductRequest {
  ids: string;
}

interface CheckoutFormState {
  name: string; phone: string; email: string; addressLine1: string; addressLine2: string;
  area: string; city: string; postalCode: string; note: string;
}

const emptyForm: CheckoutFormState = {
  name: "", phone: "", email: "", addressLine1: "", addressLine2: "", area: "", city: "Khulna", postalCode: "", note: "",
};

function rowVariantLabel(product: Product | null, variantId: string | null): string | null {
  if (!product || !variantId) return null;
  return product.variants?.find((variant) => variant.id === variantId)?.name ?? "Unavailable option";
}

export function CartPageClient({ checkout }: { checkout: PublicCheckoutConfig }) {
  const { lines, hydrated, removeItem, setQuantity, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [zoneId, setZoneId] = useState(checkout.deliveryZones[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [productLoad, setProductLoad] = useState<{
    request: ProductRequest;
    status: "success" | "error";
    products: Product[];
  } | null>(null);
  const idempotency = useRef<{ signature: string; key: string } | null>(null);
  const productIds = useMemo(() => [...new Set(lines.map((line) => line.productId))].sort(), [lines]);
  const productIdsKey = productIds.join(",");
  const productRequest = useMemo(() => ({ ids: productIdsKey }), [productIdsKey]);

  useEffect(() => {
    if (!hydrated || !productRequest.ids) return;

    const controller = new AbortController();
    const requestedKey = productRequest.ids;
    void fetch(`/api/catalog/cart?ids=${encodeURIComponent(requestedKey)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Cart products could not be loaded");
        const payload: unknown = await response.json();
        const products = parseCartProducts(payload);
        if (!controller.signal.aborted) setProductLoad({ request: productRequest, status: "success", products });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted || (cause instanceof Error && cause.name === "AbortError")) return;
        setProductLoad({ request: productRequest, status: "error", products: [] });
      });

    return () => controller.abort();
  }, [hydrated, productRequest]);

  const currentProductLoad = productLoad?.request === productRequest ? productLoad : null;
  const products = productIdsKey && currentProductLoad?.status === "success" ? currentProductLoad.products : [];
  const productsLoading = productIdsKey.length > 0 && currentProductLoad === null;
  const productsFailed = productIdsKey.length > 0 && currentProductLoad?.status === "error";
  // Cart lines are few; avoid memoizing against a freshly-created empty products array.
  const productById = new Map(products.map((product) => [product.id, product]));
  const cartRows = lines.map((line) => {
    const product = productById.get(line.productId) ?? null;
    const price = product ? resolveCartLinePrice(product.priceBdt, product.variants, line.variantId) : null;
    return { line, product, price };
  });
  const validRows = cartRows.filter((row) => !!row.product && row.product.published && row.product.orderable && row.price?.valid);
  const subtotal = validRows.reduce((sum, row) => sum + row.price!.priceBdt * row.line.quantity, 0);
  const selectedZone = checkout.deliveryZones.find((zone) => zone.id === zoneId);
  const estimatedTotal = subtotal + (selectedZone?.deliveryChargeBdt ?? 0);
  const everyItemOrderable = !productsLoading && !productsFailed && cartRows.length > 0
    && cartRows.every((row) => row.product?.orderable === true && row.product.published && row.price?.valid === true);
  const checkoutReady = checkout.checkoutEnabled && checkout.deliveryZones.length > 0;
  const cartEnquiryReady = cartRows.length > 0 && cartRows.every((row) => !!row.product && row.product.published);
  const cartEnquiryMessage = [
    "Hello Kundu Electronics, I would like to place this order request:",
    ...cartRows.map(({ line, product, price }) => {
      const productId = product?.sku || line.productId;
      const productName = product?.name ?? "Product unavailable";
      const variant = rowVariantLabel(product, line.variantId);
      const name = variant ? productName + " (" + variant + ")" : productName;
      const unit = price?.valid ? formatPriceBdt(price.priceBdt) : "Price to confirm";
      const lineTotal = price?.valid ? formatPriceBdt(price.priceBdt * line.quantity) : "To confirm";
      return productId + " - " + name + " - " + unit + " x " + line.quantity + " - " + lineTotal;
    }),
    "Delivery: " + (selectedZone ? selectedZone.name + " - " + formatPriceBdt(selectedZone.deliveryChargeBdt) : "Please confirm delivery option"),
    "Total: " + (cartRows.length > 0 && cartRows.every((row) => row.price?.valid) && selectedZone ? formatPriceBdt(estimatedTotal) : "To be confirmed by the shop"),
    ...(cartRows.some((row) => row.product?.categorySlug === "project-kits") ? ["Robot-kit figures are estimates from the supplied BOM; the shop confirms final contents and amount before payment."] : []),
    "Please confirm stock and delivery before payment. No payment has been made.",
  ].join("\n");
  const cartEnquiryUrl = business.contact.whatsappUrl + "?text=" + encodeURIComponent(cartEnquiryMessage);

  function updateField(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    idempotency.current = null;
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!everyItemOrderable || !selectedZone || !checkoutReady) {
      setError("Checkout is not ready. Confirm product availability and delivery details.");
      return;
    }

    const payload = {
      customer: {
        name: form.name, phone: form.phone, email: form.email || null,
        addressLine1: form.addressLine1, addressLine2: form.addressLine2 || null,
        area: form.area || null, city: form.city, postalCode: form.postalCode || null, note: form.note || null,
      },
      items: validRows.map(({ line }) => ({ productId: line.productId, variantId: line.variantId, quantity: line.quantity })),
      deliveryZoneId: zoneId,
    };
    const signature = JSON.stringify(payload);
    const digestBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
    const signatureDigest = Array.from(new Uint8Array(digestBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
    let stored: { signature: string; key: string } | null = null;
    try {
      const raw = sessionStorage.getItem("ke-checkout-idempotency-v1");
      stored = raw ? JSON.parse(raw) as { signature: string; key: string } : null;
    } catch { stored = null; }
    if (stored?.signature === signatureDigest && /^[0-9a-f-]{36}$/i.test(stored.key)) {
      idempotency.current = stored;
    } else if (!idempotency.current || idempotency.current.signature !== signatureDigest) {
      idempotency.current = { signature: signatureDigest, key: crypto.randomUUID() };
    }
    try { sessionStorage.setItem("ke-checkout-idempotency-v1", JSON.stringify(idempotency.current)); } catch { /* The request still has in-memory retry protection. */ }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...payload, idempotencyKey: idempotency.current.key }),
      });
      const result = await response.json() as { orderId?: string; error?: string };
      if (!response.ok || !result.orderId) {
        setError(result.error ?? "Your order could not be created. Please try again.");
        return;
      }
      clearCart();
      try { sessionStorage.removeItem("ke-checkout-idempotency-v1"); } catch { /* Ignore unavailable browser storage. */ }
      router.push(`/orders/${result.orderId}`);
    } catch {
      setError("A network error occurred. Your order may not have been submitted. Retry this same checkout to safely reuse its idempotency key.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <section className="cart-content"><p>Loading your cart…</p></section>;
  if (lines.length === 0) {
    return <div className="empty-cart"><span className="empty-cart-mark">＋</span><h2>Your cart is empty.</h2><p>Browse the verified catalogue and add products to your cart.</p><Link href="/shop" className="button button-primary">Continue shopping</Link></div>;
  }

  return (
    <div className="cart-content">
      <div className="cart-layout">
        <section className="cart-items" aria-label="Cart items">
          {cartRows.map(({ line, product, price }) => (
            <article className="cart-row" key={`${line.productId}:${line.variantId ?? ""}`}>
              <div className="cart-row-copy">
                <strong>{product?.name ?? (productsLoading ? "Checking product…" : "Product no longer available")}</strong>
                {product?.sku ? <span>SKU: {product.sku}</span> : null}
                {rowVariantLabel(product, line.variantId) ? <span>Option: {rowVariantLabel(product, line.variantId)}</span> : null}
                {product && price?.valid ? <span>{formatPriceBdt(price.priceBdt)} each</span> : product?.priceBdt === null ? <span>Price on request — confirm with the shop</span> : <span>{productsFailed ? "Product details could not be loaded. Retry the page." : "This product option is unavailable. Remove it before checkout."}</span>}
              </div>
              <div className="cart-row-actions">
                <label>Quantity <input type="number" min="1" max="99" value={line.quantity} disabled={!product} onChange={(event) => setQuantity(line.productId, Number(event.target.value), line.variantId)} /></label>
                <strong>{product && price?.valid ? formatPriceBdt(price.priceBdt * line.quantity) : "—"}</strong>
                <button type="button" className="text-button" onClick={() => removeItem(line.productId, line.variantId)}>Remove</button>
              </div>
            </article>
          ))}
          <div className="cart-items-footer"><button type="button" className="text-button" onClick={clearCart}>Clear cart</button><Link href="/shop">Continue shopping</Link></div>
        </section>

        <aside className="cart-summary">
          <h2>{checkoutReady ? "Order summary" : "Enquiry summary"}</h2>
          <div><span>{checkoutReady ? "Estimated subtotal" : "Prices"}</span><strong>{checkoutReady ? formatPriceBdt(subtotal) : "To be confirmed"}</strong></div>
          <div><span>Delivery</span><strong>{checkoutReady && selectedZone ? formatPriceBdt(selectedZone.deliveryChargeBdt) : "To be confirmed"}</strong></div>
          <div className="cart-summary-total"><span>{checkoutReady ? "Estimated total" : "Final total"}</span><strong>{checkoutReady ? formatPriceBdt(estimatedTotal) : "After shop confirmation"}</strong></div>
          <p>{checkoutReady ? "Final prices and delivery charge are recalculated by the server from the live database when you place the order." : "This is an enquiry only. The shop will confirm prices, stock and delivery before any order is accepted."}</p>
        </aside>
      </div>

      <section className="checkout-section">
        <span className="section-kicker">SECURE ORDER CREATION</span>
        <h2>Place your order</h2>
        {!checkoutReady ? (
          <div className="notice-panel">
            <strong>Website order checkout is unavailable in this session</strong>
            <p>You can still send the complete cart on WhatsApp or call the shop. Online payment is not collected; the shop confirms stock and delivery before arranging payment.</p>
            {cartEnquiryReady ? <Link className="button button-primary" href={cartEnquiryUrl} target="_blank" rel="noopener noreferrer">Send order on WhatsApp ↗</Link> : <p>Load or remove unavailable cart items before sending a complete enquiry.</p>}
          </div>
        ) : (
          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="checkout-fields">
              <label>Recipient name<input required maxLength={160} value={form.name} onChange={(e) => updateField("name", e.target.value)} /></label>
              <label>Phone number<input required type="tel" maxLength={32} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></label>
              <label>Email (optional)<input type="email" maxLength={254} value={form.email} onChange={(e) => updateField("email", e.target.value)} /></label>
              <label>Address line 1<input required maxLength={220} value={form.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} /></label>
              <label>Address line 2 (optional)<input maxLength={220} value={form.addressLine2} onChange={(e) => updateField("addressLine2", e.target.value)} /></label>
              <label>Area (optional)<input maxLength={120} value={form.area} onChange={(e) => updateField("area", e.target.value)} /></label>
              <label>City<input required maxLength={120} value={form.city} onChange={(e) => updateField("city", e.target.value)} /></label>
              <label>Postal code (optional)<input maxLength={24} value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} /></label>
              <div className="delivery-speed-field">
                <span className="delivery-speed-label">Choose delivery speed</span>
                <div className="delivery-speed-choices" role="group" aria-label="Delivery speed">
                  {checkout.deliveryZones.map((zone) => {
                    const urgent = zone.code === "urgent-30m-1h";
                    return (
                      <button
                        className={`delivery-speed-choice ${urgent ? "delivery-speed-urgent" : "delivery-speed-standard"} ${zoneId === zone.id ? "is-selected" : ""}`}
                        type="button"
                        key={zone.id}
                        aria-pressed={zoneId === zone.id}
                        onClick={() => { setZoneId(zone.id); idempotency.current = null; }}
                      >
                        <span className="delivery-speed-choice-heading"><strong>{urgent ? "Urgent" : "Standard"}</strong><b>{formatPriceBdt(zone.deliveryChargeBdt)}</b></span>
                        <span>{urgent ? "30–60 minutes" : "12 hours–1 day"}</span>
                        {urgent ? <small>Priority handling · subject to address confirmation</small> : <small>Regular delivery</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="checkout-note">Order note (optional)<textarea maxLength={500} value={form.note} onChange={(e) => updateField("note", e.target.value)} rows={3} /></label>
            </div>
            {!everyItemOrderable ? <p className="form-error">One or more cart items are unpublished or not currently orderable. Remove them before checkout.</p> : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button button-primary" type="submit" disabled={submitting || productsLoading || productsFailed || !everyItemOrderable || !selectedZone}>{submitting ? "Saving your order…" : "Place order on website"}</button>
            <div className="checkout-payment-note"><strong>No online payment is taken at checkout.</strong><p>Your order request is recorded first. The shop confirms stock, exact kit contents and final amount where relevant, plus the delivery address, then contacts you to arrange payment.</p></div><p className="checkout-disclaimer">Product prices and delivery charges are recalculated by the server. An order is not marked paid until the shop verifies payment separately.</p>
          </form>
        )}
      </section>
      <section className="order-channel-section">
        <div><span className="section-kicker">OTHER WAYS TO ORDER</span><h2>Prefer WhatsApp or a call?</h2><p>The WhatsApp message includes each product code, name, unit price × quantity, line total, delivery charge and final total.</p></div>
        <div className="order-channel-actions">
          <Link className="button button-primary" href={cartEnquiryUrl} target="_blank" rel="noopener noreferrer">Send full order on WhatsApp ↗</Link>
          <a className="button button-outline" href={"tel:" + business.contact.publicPhone}>Call {business.contact.publicPhoneDisplay}</a>
        </div>
      </section>
    </div>
  );
}
