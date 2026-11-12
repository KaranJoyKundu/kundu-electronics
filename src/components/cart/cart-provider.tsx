"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine { productId: string; variantId: string | null; quantity: number }
interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  hydrated: boolean;
  addItem: (productId: string, quantity?: number, variantId?: string | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "kundu-electronics-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return typeof line.productId === "string" && uuidPattern.test(line.productId)
    && (line.variantId === null || (typeof line.variantId === "string" && uuidPattern.test(line.variantId)))
    && typeof line.quantity === "number" && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 99;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) setLines(parsed.filter(isCartLine));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* Cart remains usable for this tab. */ }
  }, [lines, hydrated]);

  const addItem = useCallback((productId: string, quantity = 1, variantId: string | null = null) => {
    if (!uuidPattern.test(productId) || (variantId !== null && !uuidPattern.test(variantId))) return;
    const safeQuantity = Number.isInteger(quantity) ? Math.min(99, Math.max(1, quantity)) : 1;
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId && line.variantId === variantId);
      if (existing) return current.map((line) => line === existing ? { ...line, quantity: Math.min(99, line.quantity + safeQuantity) } : line);
      return [...current, { productId, variantId, quantity: safeQuantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId: string | null = null) => {
    setLines((current) => current.filter((line) => line.productId !== productId || line.variantId !== variantId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number, variantId: string | null = null) => {
    if (!Number.isInteger(quantity) || quantity < 1) { removeItem(productId, variantId); return; }
    setLines((current) => current.map((line) => line.productId === productId && line.variantId === variantId
      ? { ...line, quantity: Math.min(99, quantity) } : line));
  }, [removeItem]);

  const clearCart = useCallback(() => setLines([]), []);
  const value = useMemo(() => ({
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    hydrated,
    addItem, removeItem, setQuantity, clearCart,
  }), [lines, hydrated, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
