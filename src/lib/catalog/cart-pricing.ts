import type { ProductVariant } from "./types.ts";

export interface CartPriceResolution {
  valid: boolean;
  priceBdt: number;
  variant: ProductVariant | null;
}

/** Resolve a cart line against the current published variant set and base price. */
export function resolveCartLinePrice(
  basePriceBdt: number,
  variants: readonly ProductVariant[] = [],
  selectedVariantId: string | null = null,
): CartPriceResolution {
  if (!Number.isSafeInteger(basePriceBdt) || basePriceBdt <= 0) {
    return { valid: false, priceBdt: 0, variant: null };
  }
  if (variants.length === 0) {
    return selectedVariantId === null
      ? { valid: true, priceBdt: basePriceBdt, variant: null }
      : { valid: false, priceBdt: 0, variant: null };
  }
  if (!selectedVariantId) return { valid: false, priceBdt: 0, variant: null };
  const variant = variants.find((item) => item.id === selectedVariantId);
  if (!variant) return { valid: false, priceBdt: 0, variant: null };
  const priceBdt = variant.priceOverrideBdt ?? basePriceBdt;
  if (!Number.isSafeInteger(priceBdt) || priceBdt <= 0) {
    return { valid: false, priceBdt: 0, variant: null };
  }
  return { valid: true, priceBdt, variant };
}
