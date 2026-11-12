import type { Product } from "./types.ts";

/**
 * Case-insensitive partial search across customer-safe catalogue fields.
 * A query of `b` will return Breadboard when Breadboard exists in the published catalogue.
 */
export function searchProducts(products: readonly Product[], query: string): Product[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  return products
    .filter((product) => product.published)
    .map((product) => {
      const haystack = [product.name, product.sku, product.brand, product.summary, product.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matched = tokens.every((token) => haystack.includes(token));
      if (!matched) return null;

      const name = product.name.toLocaleLowerCase();
      const score = name.startsWith(normalized) ? 3 : name.includes(normalized) ? 2 : 1;
      return { product, score };
    })
    .filter((entry): entry is { product: Product; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product);
}

export interface CatalogueFilters {
  query?: string;
  categorySlug?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: "relevance" | "name-asc" | "price-asc" | "price-desc";
}

export function filterProducts(products: readonly Product[], filters: CatalogueFilters): Product[] {
  let result = products.filter((product) => product.published);

  if (filters.query?.trim()) {
    result = searchProducts(result, filters.query);
  }
  if (filters.categorySlug) {
    result = result.filter((product) => product.categorySlug === filters.categorySlug);
  }
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    result = result.filter((product) => product.priceBdt >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    result = result.filter((product) => product.priceBdt <= filters.maxPrice!);
  }

  switch (filters.sort) {
    case "name-asc":
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return [...result].sort((a, b) => a.priceBdt - b.priceBdt);
    case "price-desc":
      return [...result].sort((a, b) => b.priceBdt - a.priceBdt);
    default:
      return result;
  }
}
