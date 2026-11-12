"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import type { PublicCheckoutConfig } from "@/data/storefront";
import { useCart } from "@/components/cart/cart-provider";
import { formatPriceBdt } from "@/lib/format";
import { resolveCartLinePrice } from "@/lib/catalog/cart-pricing";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsFailed, setProductsFailed] = useState(false);
  const idempotency = useRef<{ signature: string; key: string } | null>(null);
  const productIds = useMemo(() => [...new Set(lines.map((line) => line.productId))].sort(), [lines]);
  const productIdsKey = productIds.join(",");

  useEffect(() => {
    if (!hydrated) return;
    if (!productIdsKey) {
      setProducts([]);
      setProductsLoading(false);
      setProductsFailed(false);
      return;
    }
    const controller = new AbortController();
    setProductsLoading(true);
    setProductsFailed(false);
    fetch(`/api/catalog/cart?ids=${encodeURIComponent(productIdsKey)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { products?: Product[] };
        if (!response.ok) throw new Error("Cart products could not be loaded");
        setProducts(Array.isArray(payload.products) ? payload.products : []);
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setProducts([]);
        setProductsFailed(true);
      })
      .finally(() => { if (!controller.signal.aborted) setProductsLoading(false); });
    return () => controller.abort();
  }, [hydrated, productIdsKey]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
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
  const checkoutReady = checkout.checkoutEnabled && checkout.deliveryZones.length > 0 && checkout.paymentMethods.length > 0;

  function updateField(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    idempotency.current = null;
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!everyItemOrderable || !selectedZone || !checkoutReady) {
      setError("Checkout is not ready. Confirm product availability and store payment/delivery settings.");
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
                {product && price?.valid ? <span>{formatPriceBdt(price.priceBdt)} each</span> : <span>{productsFailed ? "Product details could not be loaded. Retry the page." : "This product option is unavailable. Remove it before checkout."}</span>}
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
          <h2>Order summary</h2>
          <div><span>Estimated subtotal</span><strong>{formatPriceBdt(subtotal)}</strong></div>
          <div><span>Delivery</span><strong>{selectedZone ? formatPriceBdt(selectedZone.deliveryChargeBdt) : "To be configured"}</strong></div>
          <div className="cart-summary-total"><span>Estimated total</span><strong>{formatPriceBdt(estimatedTotal)}</strong></div>
          <p>Final prices and delivery charge are recalculated by the server from the live database when you place the order.</p>
        </aside>
      </div>

      <section className="checkout-section">
        <span className="section-kicker">SECURE ORDER CREATION</span>
        <h2>Delivery details</h2>
        {!checkoutReady ? (
          <div className="notice-panel">
            <strong>Checkout is not enabled yet</strong>
            <p>The store has not configured and enabled an approved delivery charge, delivery area and manual payment receiving instructions. Your cart is saved locally; no order or payment will be simulated.</p>
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
              <label>Delivery area<select required value={zoneId} onChange={(e) => { setZoneId(e.target.value); idempotency.current = null; }}><option value="">Choose a delivery area</option>{checkout.deliveryZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name} — {formatPriceBdt(zone.deliveryChargeBdt)}</option>)}</select></label>
              <label className="checkout-note">Order note (optional)<textarea maxLength={500} value={form.note} onChange={(e) => updateField("note", e.target.value)} rows={3} /></label>
            </div>
            {!everyItemOrderable ? <p className="form-error">One or more cart items are unpublished or not currently orderable. Remove them before checkout.</p> : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button button-primary" type="submit" disabled={submitting || productsLoading || productsFailed || !everyItemOrderable || !selectedZone}>{submitting ? "Creating order…" : "Place order"}</button>
            <p className="checkout-disclaimer">Order totals are determined by the server. Payment is not taken automatically; manual payment submissions remain pending until the shop verifies them.</p>
          </form>
        )}
      </section>
    </div>
  );
}
