"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({ productId, disabled = false }: { productId: string; disabled?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <div className="add-to-cart-control">
      <button className="button button-primary" type="button" disabled={disabled} onClick={() => {
        addItem(productId);
        setAdded(true);
      }}>
        {disabled ? "Currently unavailable" : added ? "Added to cart" : "Add to cart"}
      </button>
      {added ? <span role="status" aria-live="polite">Added to your cart.</span> : null}
    </div>
  );
}
