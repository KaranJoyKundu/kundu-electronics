import type { Product, ProductAvailability, ProductImage, ProductVariant } from "./types.ts";

export interface SearchSuggestion {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  category: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const availabilityValues = new Set<string>([
  "unknown", "availability_on_request", "in_stock", "low_stock",
  "out_of_stock", "backorder", "discontinued", "build_to_order",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isProductAvailability(value: unknown): value is ProductAvailability {
  return typeof value === "string" && availabilityValues.has(value);
}

function parseImage(value: unknown): ProductImage | null {
  if (!isRecord(value) || typeof value.src !== "string" || typeof value.alt !== "string") return null;
  if (value.width !== undefined && (typeof value.width !== "number" || !Number.isSafeInteger(value.width) || value.width <= 0)) return null;
  if (value.height !== undefined && (typeof value.height !== "number" || !Number.isSafeInteger(value.height) || value.height <= 0)) return null;
  return {
    src: value.src,
    alt: value.alt,
    ...(typeof value.width === "number" ? { width: value.width } : {}),
    ...(typeof value.height === "number" ? { height: value.height } : {}),
  };
}

function parseVariant(value: unknown): ProductVariant | null {
  if (!isRecord(value) || typeof value.id !== "string" || !UUID.test(value.id)
    || !isNullableString(value.sku) || typeof value.name !== "string" || !isRecord(value.optionValues)) return null;

  const optionValues: Record<string, string> = {};
  for (const [key, item] of Object.entries(value.optionValues)) {
    if (typeof item !== "string") return null;
    optionValues[key] = item;
  }

  const price = value.priceOverrideBdt;
  if (price !== null && !isPositiveSafeInteger(price)) return null;

  return {
    id: value.id,
    sku: value.sku,
    name: value.name,
    optionValues,
    priceOverrideBdt: price,
  };
}

function parseProduct(value: unknown): Product | null {
  if (!isRecord(value)
    || typeof value.id !== "string" || !UUID.test(value.id)
    || !isOptionalString(value.sku)
    || typeof value.slug !== "string"
    || typeof value.name !== "string"
    || !isOptionalString(value.brand)
    || !isOptionalString(value.summary)
    || !isOptionalString(value.description)
    || !isPositiveSafeInteger(value.priceBdt)
    || typeof value.categorySlug !== "string"
    || !isProductAvailability(value.availability)
    || !Array.isArray(value.images)
    || (value.variants !== undefined && !Array.isArray(value.variants))
    || typeof value.published !== "boolean"
    || (value.orderable !== undefined && typeof value.orderable !== "boolean")
    || typeof value.updatedAt !== "string") return null;

  const rawImages: unknown[] = value.images;
  const rawVariants: unknown[] = Array.isArray(value.variants) ? value.variants : [];
  const images: ProductImage[] = [];
  for (const candidate of rawImages) {
    const image = parseImage(candidate);
    if (!image) return null;
    images.push(image);
  }
  const variants: ProductVariant[] = [];
  for (const candidate of rawVariants) {
    const variant = parseVariant(candidate);
    if (!variant) return null;
    variants.push(variant);
  }

  return {
    id: value.id,
    ...(value.sku === undefined ? {} : { sku: value.sku }),
    slug: value.slug,
    name: value.name,
    ...(value.brand === undefined ? {} : { brand: value.brand }),
    ...(value.summary === undefined ? {} : { summary: value.summary }),
    ...(value.description === undefined ? {} : { description: value.description }),
    priceBdt: Number(value.priceBdt),
    categorySlug: value.categorySlug,
    availability: value.availability,
    images,
    variants,
    published: value.published,
    ...(value.orderable === undefined ? {} : { orderable: value.orderable }),
    updatedAt: value.updatedAt,
  };
}

/** Validate a JSON response from the customer-safe cart-product endpoint. */
export function parseCartProducts(value: unknown): Product[] {
  if (!isRecord(value) || !Array.isArray(value.products)) return [];
  const candidates: unknown[] = value.products;
  return candidates.flatMap((candidate): Product[] => {
    const product = parseProduct(candidate);
    return product ? [product] : [];
  });
}

/** Validate autocomplete rows before they are used in links or labels. */
export function parseSearchSuggestions(value: unknown): SearchSuggestion[] {
  if (!isRecord(value) || !Array.isArray(value.products)) return [];
  const candidates: unknown[] = value.products;
  return candidates.flatMap((candidate): SearchSuggestion[] => {
    if (!isRecord(candidate)
      || typeof candidate.id !== "string" || !UUID.test(candidate.id)
      || typeof candidate.slug !== "string"
      || typeof candidate.name !== "string"
      || !isNullableString(candidate.sku)
      || typeof candidate.category !== "string"
    ) return [];
    return [{
      id: candidate.id,
      slug: candidate.slug,
      name: candidate.name,
      sku: candidate.sku,
      category: candidate.category,
    }];
  });
}
