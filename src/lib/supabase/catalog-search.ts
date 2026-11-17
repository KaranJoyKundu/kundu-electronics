import type { ProductAvailability } from "../catalog/types.ts";

export interface CatalogSearchRow {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  short_description: string | null;
  price_bdt: number | null;
  public_availability: ProductAvailability;
  category_slug: string;
  primary_image_path: string | null;
}

function isProductAvailability(value: unknown): value is ProductAvailability {
  return value === "unknown"
    || value === "availability_on_request"
    || value === "in_stock"
    || value === "low_stock"
    || value === "out_of_stock"
    || value === "backorder"
    || value === "discontinued"
    || value === "build_to_order";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** Validate the untyped PostgREST RPC payload before it enters application code. */
export function parseCatalogSearchRows(value: unknown): CatalogSearchRow[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate): CatalogSearchRow[] => {
    if (!isRecord(candidate)) return [];

    const price = candidate.price_bdt === null
      ? null
      : typeof candidate.price_bdt === "number"
        ? candidate.price_bdt
        : typeof candidate.price_bdt === "string" && /^\d+$/.test(candidate.price_bdt)
          ? Number(candidate.price_bdt)
          : Number.NaN;

    const availability = candidate.public_availability;
    if (
      typeof candidate.id !== "string"
      || typeof candidate.slug !== "string"
      || typeof candidate.name !== "string"
      || !nullableString(candidate.sku)
      || !nullableString(candidate.brand)
      || !nullableString(candidate.short_description)
      || (price !== null && (!Number.isSafeInteger(price) || price <= 0))
      || !isProductAvailability(availability)
      || typeof candidate.category_slug !== "string"
      || !nullableString(candidate.primary_image_path)
    ) return [];

    return [{
      id: candidate.id,
      slug: candidate.slug,
      name: candidate.name,
      sku: candidate.sku,
      brand: candidate.brand,
      short_description: candidate.short_description,
      price_bdt: price,
      public_availability: availability,
      category_slug: candidate.category_slug,
      primary_image_path: candidate.primary_image_path,
    }];
  });
}
