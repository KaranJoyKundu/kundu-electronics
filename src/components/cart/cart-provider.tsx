"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { CartLine } from "@/lib/cart/types";
import {
  getCartSnapshot,
  getHydratedSnapshot,
  getServerCartSnapshot,
  getServerHydratedSnapshot,
  subscribeToCart,
  subscribeToHydration,
  updateCart,
} from "@/lib/cart/cart-store";

interface CartContextValue {
  lines: readonly CartLine[];
  itemCount: number;
  hydrated: boolean;
  addItem: (productId: string, quantity?: number, variantId?: string | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);

  const addItem = useCallback((productId: string, quantity = 1, variantId: string | null = null) => {
    if (!uuidPattern.test(productId) || (variantId !== null && !uuidPattern.test(variantId))) return;
    const safeQuantity = Number.isInteger(quantity) ? Math.min(99, Math.max(1, quantity)) : 1;
    updateCart((current) => {
      const existing = current.find((line) => line.productId === productId && line.variantId === variantId);
      if (existing) return current.map((line) => line === existing ? { ...line, quantity: Math.min(99, line.quantity + safeQuantity) } : line);
      return [...current, { productId, variantId, quantity: safeQuantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId: string | null = null) => {
    updateCart((current) => current.filter((line) => line.productId !== productId || line.variantId !== variantId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number, variantId: string | null = null) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      removeItem(productId, variantId);
      return;
    }
    updateCart((current) => current.map((line) => line.productId === productId && line.variantId === variantId
      ? { ...line, quantity: Math.min(99, quantity) } : line));
  }, [removeItem]);

  const clearCart = useCallback(() => updateCart(() => []), []);
  const value = useMemo(() => ({
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    hydrated,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
  }), [lines, hydrated, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
