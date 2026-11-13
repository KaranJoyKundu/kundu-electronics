"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import type { ProductVariant } from "@/lib/catalog/types";
import { resolveCartLinePrice } from "@/lib/catalog/cart-pricing";
import { formatPriceBdt } from "@/lib/format";

export function ProductPurchaseControl({ productId, basePriceBdt, orderable, variants }: {
  productId: string;
  basePriceBdt: number;
  orderable: boolean;
  variants: readonly ProductVariant[];
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(variants.length === 1 ? variants[0].id : "");
  const [quantity, setQuantity] = useState("1");
  const [added, setAdded] = useState(false);
  const safeQuantity = Number(quantity);
  const price = useMemo(
    () => resolveCartLinePrice(basePriceBdt, variants, variantId || null),
    [basePriceBdt, variants, variantId],
  );
  const requiresOption = variants.length > 0;
  const validQuantity = Number.isInteger(safeQuantity) && safeQuantity >= 1 && safeQuantity <= 99;
  const canAdd = orderable && price.valid && (!requiresOption || !!variantId) && validQuantity;

  return (
    <div className="product-purchase-control">
      {requiresOption ? (
        <label className="product-option-field">Choose an option
          <select className="field" value={variantId} onChange={(event) => { setVariantId(event.target.value); setAdded(false); }}>
            {variants.length > 1 ? <option value="">Select an option</option> : null}
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}{Object.entries(variant.optionValues).length ? ` · ${Object.entries(variant.optionValues).map(([key, value]) => `${key}: ${value}`).join(" · ")}` : ""}{variant.priceOverrideBdt ? ` — ${formatPriceBdt(variant.priceOverrideBdt)}` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="product-purchase-row">
        <label>Quantity
          <input className="field" type="number" min="1" max="99" step="1" inputMode="numeric" value={quantity}
            onChange={(event) => { setQuantity(event.target.value); setAdded(false); }} />
        </label>
        <strong className="product-selected-price">{price.valid ? formatPriceBdt(price.priceBdt) : "Choose an option"}</strong>
      </div>
      <button className="button button-primary" type="button" disabled={!canAdd} onClick={() => {
        if (!canAdd) return;
        addItem(productId, safeQuantity, variantId || null);
        setAdded(true);
      }}>
        {!orderable ? "Currently unavailable" : !price.valid ? "Select an option" : !validQuantity ? "Check quantity" : added ? "Added to cart" : "Add to cart"}
      </button>
      {added ? <span role="status" aria-live="polite">Added to your cart.</span> : null}
    </div>
  );
}
