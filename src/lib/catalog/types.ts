export type ProductAvailability =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "backorder"
  | "discontinued"
  | "build_to_order";

export interface ProductImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Public product shape. Supplier cost and private stock notes are deliberately absent. */
export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand?: string;
  summary?: string;
  description?: string;
  priceBdt: number;
  categorySlug: string;
  availability: ProductAvailability;
  images: ProductImage[];
  published: boolean;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  parentSlug?: string;
  published: boolean;
  sortOrder: number;
}
