import type { Category, Product } from "@/lib/catalog/types";

/**
 * Verified public catalogue.
 * Keep empty until the owner supplies a selling-price/inventory source and it is reviewed.
 * Never map purchase cost into Product.priceBdt.
 */
export const products: readonly Product[] = [];

/** Categories remain unpublished until reconciled against the actual inventory. */
export const categories: readonly Category[] = [];

export function getPublishedProducts(): Product[] {
  return products.filter((product) => product.published);
}

export function getPublishedCategories(): Category[] {
  return categories
    .filter((category) => category.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
