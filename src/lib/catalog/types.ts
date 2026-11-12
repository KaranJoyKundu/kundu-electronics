export type ProductAvailability =
  | "unknown"
  | "availability_on_request"
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
export interface ProductVariant {
  id: string;
  sku: string | null;
  name: string;
  optionValues: Record<string, string>;
  priceOverrideBdt: number | null;
}

export interface Product {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  brand?: string;
  summary?: string;
  description?: string;
  priceBdt: number;
  categorySlug: string;
  availability: ProductAvailability;
  images: ProductImage[];
  variants?: ProductVariant[];
  published: boolean;
  orderable?: boolean;
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
