import { NextResponse, type NextRequest } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { jsonError } from "@/lib/security/request";
import type { Product, ProductAvailability } from "@/lib/catalog/types";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AVAILABILITY = new Set<ProductAvailability>([
  "unknown", "availability_on_request", "in_stock", "low_stock", "out_of_stock",
  "backorder", "discontinued", "build_to_order",
]);

/** Fetch only the cart's product IDs, never the full catalogue. */
export async function GET(request: NextRequest) {
  const rawIds = request.nextUrl.searchParams.get("ids") ?? "";
  if (!rawIds || rawIds.length > 40 * 37) return jsonError(400, "Cart product identifiers are invalid.");
  const ids = [...new Set(rawIds.split(","))];
  if (ids.length < 1 || ids.length > 40 || ids.some((id) => !UUID.test(id))) {
    return jsonError(400, "Cart product identifiers are invalid.");
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ products: [], configured: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: rows, error } = await supabase.from("catalog_products")
    .select("id,category_id,sku,slug,name,brand,short_description,description,price_bdt,public_availability,orderable,published_at")
    .in("id", ids);
  if (error) return jsonError(503, "Cart product details are temporarily unavailable.");

  const visibleRows = rows ?? [];
  const productIds = visibleRows.map((row) => row.id);
  const categoryIds = [...new Set(visibleRows.map((row) => row.category_id))];
  const [
    { data: categories, error: categoriesError },
    { data: images, error: imagesError },
    { data: variantRows, error: variantsError },
  ] = await Promise.all([
    categoryIds.length
      ? supabase.from("catalog_categories").select("id,slug").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length
      ? supabase.from("catalog_product_images").select("product_id,storage_path,alt_text,sort_order,is_primary")
          .in("product_id", productIds).order("is_primary", { ascending: false }).order("sort_order")
      : Promise.resolve({ data: [], error: null }),
    productIds.length
      ? supabase.from("catalog_product_variants").select("id,product_id,sku,name,option_values,price_override_bdt,sort_order")
          .in("product_id", productIds).order("sort_order")
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (categoriesError || imagesError || variantsError) return jsonError(503, "Cart product details are temporarily unavailable.");

  const categoryById = new Map((categories ?? []).map((row) => [row.id, row.slug]));
  const imageRows = images ?? [];
  const variantsByProduct = new Map<string, NonNullable<Product["variants"]>>();
  for (const row of variantRows ?? []) {
    const optionValues = row.option_values && typeof row.option_values === "object" && !Array.isArray(row.option_values)
      ? Object.fromEntries(Object.entries(row.option_values as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
      : {};
    const override = row.price_override_bdt === null ? null : Number(row.price_override_bdt);
    if (override !== null && (!Number.isSafeInteger(override) || override <= 0)) continue;
    const existing = variantsByProduct.get(row.product_id) ?? [];
    existing.push({ id: row.id, sku: row.sku ?? null, name: row.name, optionValues, priceOverrideBdt: override });
    variantsByProduct.set(row.product_id, existing);
  }
  const signed = imageRows.length
    ? await supabase.storage.from("product-images").createSignedUrls(imageRows.map((row) => row.storage_path), 60 * 60)
    : { data: [], error: null };
  const signedByPath = new Map((signed.data ?? []).flatMap((row) => row.path && row.signedUrl ? [[row.path, row.signedUrl] as const] : []));
  const imagesByProduct = new Map<string, Product["images"]>();
  for (const image of imageRows) {
    const src = signedByPath.get(image.storage_path);
    if (!src) continue;
    const current = imagesByProduct.get(image.product_id) ?? [];
    current.push({ src, alt: image.alt_text });
    imagesByProduct.set(image.product_id, current);
  }

  const products: Product[] = visibleRows.flatMap((row) => {
    const categorySlug = categoryById.get(row.category_id);
    const priceBdt = Number(row.price_bdt);
    if (!categorySlug || !Number.isSafeInteger(priceBdt) || priceBdt <= 0) return [];
    const availability = typeof row.public_availability === "string" && AVAILABILITY.has(row.public_availability as ProductAvailability)
      ? row.public_availability as ProductAvailability : "unknown";
    return [{
      id: row.id, sku: row.sku ?? "", slug: row.slug, name: row.name,
      brand: row.brand ?? undefined, summary: row.short_description ?? undefined,
      description: row.description ?? undefined, priceBdt, categorySlug,
      availability, images: imagesByProduct.get(row.id) ?? [], variants: variantsByProduct.get(row.id) ?? [], published: true,
      orderable: row.orderable === true, updatedAt: row.published_at ?? "",
    }];
  });

  return NextResponse.json({ products, configured: true }, { headers: { "Cache-Control": "no-store" } });
}
