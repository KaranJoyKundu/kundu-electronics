import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Category, Product, ProductAvailability, ProductVariant } from "@/lib/catalog/types";
import { getPublishedCategories, getPublishedProducts } from "@/data/catalogue";
import { parsePublicPaymentMethods, type ConfiguredPaymentMethod } from "@/lib/checkout/payment-methods";

const availabilityValues = new Set<ProductAvailability>([
  "unknown", "in_stock", "low_stock", "out_of_stock", "availability_on_request",
  "backorder", "discontinued", "build_to_order",
]);

function safeAvailability(value: unknown): ProductAvailability {
  return typeof value === "string" && availabilityValues.has(value as ProductAvailability)
    ? value as ProductAvailability
    : "unknown";
}

const ownerProvidedPreviewSkus = new Set(["P002","P004","P019","P023","P025","P027","P029","P034","P035","P036","P037","P038","P050","P063","P080","P181"]);
function localOwnerProvidedImages(sku: string | null | undefined, name: string): Product["images"] {
  return sku && ownerProvidedPreviewSkus.has(sku) ? [{ src: `/product-previews/${sku}.webp`, alt: name }] : [];
}

export async function getStorefrontCatalogue(productLimit = 8, page = 1): Promise<{ products: Product[]; categories: Category[]; connected: boolean }> {
  const safeProductLimit = Number.isInteger(productLimit) ? Math.min(24, Math.max(1, productLimit)) : 8;
  const safePage = Number.isSafeInteger(page) ? Math.min(400, Math.max(1, page)) : 1;
  const offset = (safePage - 1) * safeProductLimit;
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    const fallback = getPublishedProducts();
    return { products: fallback.slice(offset, offset + safeProductLimit), categories: getPublishedCategories(), connected: false };
  }

  const [categoryResult, productResult] = await Promise.all([
    supabase.from("catalog_categories").select("id,parent_id,slug,name,description,sort_order").order("sort_order").order("name"),
    supabase.from("catalog_products").select("id,category_id,sku,slug,name,brand,short_description,description,price_bdt,public_availability,orderable,sort_order,published_at").order("sort_order").order("name").range(offset, offset + safeProductLimit - 1),
  ]);

  // A failed public query does not fall back to stale or fabricated data.
  if (categoryResult.error || productResult.error) {
    return { products: [], categories: [], connected: true };
  }

  const categoryRows = categoryResult.data ?? [];
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const categories: Category[] = categoryRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    parentSlug: row.parent_id ? categoryById.get(row.parent_id)?.slug : undefined,
    published: true,
    sortOrder: row.sort_order,
  }));

  const productRows = productResult.data ?? [];
  const productIds = productRows.map((row) => row.id);
  let imageRows: Array<{ id: string; product_id: string; storage_path: string; alt_text: string; sort_order: number; is_primary: boolean }> = [];
  if (productIds.length > 0) {
    const imageResult = await supabase
      .from("catalog_product_images")
      .select("id,product_id,storage_path,alt_text,sort_order,is_primary")
      .in("product_id", productIds)
      .order("is_primary", { ascending: false })
      .order("sort_order");
    if (!imageResult.error) imageRows = imageResult.data ?? [];
  }

  const signedByPath = new Map<string, string>();
  if (imageRows.length > 0) {
    const signedResult = await supabase.storage.from("product-images").createSignedUrls(
      imageRows.map((row) => row.storage_path), 60 * 60,
    );
    if (!signedResult.error) {
      for (const item of signedResult.data ?? []) {
        if (item.path && item.signedUrl) signedByPath.set(item.path, item.signedUrl);
      }
    }
  }

  const imagesByProduct = new Map<string, Product["images"]>();
  for (const image of imageRows) {
    const signedUrl = signedByPath.get(image.storage_path);
    if (!signedUrl) continue;
    const existing = imagesByProduct.get(image.product_id) ?? [];
    existing.push({ src: signedUrl, alt: image.alt_text });
    imagesByProduct.set(image.product_id, existing);
  }

  const products: Product[] = productRows.flatMap((row) => {
    const category = categoryById.get(row.category_id);
    const price = Number(row.price_bdt);
    if (!category || !Number.isSafeInteger(price) || price <= 0) return [];
    return [{
      id: row.id,
      sku: row.sku ?? "",
      slug: row.slug,
      name: row.name,
      brand: row.brand ?? undefined,
      summary: row.short_description ?? undefined,
      description: row.description ?? undefined,
      priceBdt: price,
      categorySlug: category.slug,
      availability: safeAvailability(row.public_availability),
      images: (imagesByProduct.get(row.id)?.length ? imagesByProduct.get(row.id)! : localOwnerProvidedImages(row.sku, row.name)),
      published: true,
      orderable: row.orderable === true,
      updatedAt: row.published_at ?? "",
    }];
  });

  return { products, categories, connected: true };
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return getPublishedCategories();
  const { data, error } = await supabase.from("catalog_categories")
    .select("id,parent_id,slug,name,description,sort_order").order("sort_order").order("name");
  if (error) return [];
  const rows = data ?? [];
  const categoryById = new Map(rows.map((row) => [row.id, row]));
  return rows.map((row) => ({
    id: row.id, slug: row.slug, name: row.name, description: row.description ?? undefined,
    parentSlug: row.parent_id ? categoryById.get(row.parent_id)?.slug : undefined,
    published: true, sortOrder: row.sort_order,
  }));
}

export async function getStorefrontProduct(slug: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return getPublishedProducts().find((product) => product.slug === slug) ?? null;
  const { data: row, error } = await supabase.from("catalog_products")
    .select("id,category_id,sku,slug,name,brand,short_description,description,price_bdt,public_availability,orderable,published_at")
    .eq("slug", slug).maybeSingle();
  if (error || !row || !Number.isSafeInteger(Number(row.price_bdt)) || Number(row.price_bdt) <= 0) return null;
  const [{ data: category }, { data: images }] = await Promise.all([
    supabase.from("catalog_categories").select("slug").eq("id", row.category_id).maybeSingle(),
    supabase.from("catalog_product_images").select("storage_path,alt_text,sort_order,is_primary")
      .eq("product_id", row.id).order("is_primary", { ascending: false }).order("sort_order"),
  ]);
  if (!category) return null;
  const imageRows = images ?? [];
  const signed = imageRows.length ? await supabase.storage.from("product-images").createSignedUrls(imageRows.map((image) => image.storage_path), 60 * 60) : { data: [], error: null };
  const urls = new Map((signed.data ?? []).flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
  return {
    id: row.id, sku: row.sku ?? "", slug: row.slug, name: row.name, brand: row.brand ?? undefined,
    summary: row.short_description ?? undefined, description: row.description ?? undefined,
    priceBdt: Number(row.price_bdt), categorySlug: category.slug, availability: safeAvailability(row.public_availability),
    images: imageRows.flatMap((image) => urls.has(image.storage_path) ? [{ src: urls.get(image.storage_path)!, alt: image.alt_text }] : []).length > 0 ? imageRows.flatMap((image) => urls.has(image.storage_path) ? [{ src: urls.get(image.storage_path)!, alt: image.alt_text }] : []) : localOwnerProvidedImages(row.sku, row.name),
    published: true, orderable: row.orderable === true, updatedAt: row.published_at ?? "",
  };
}

export async function getStorefrontProductDetails(productId: string) {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return { variants: [], specifications: [] };

  const [variantResult, specificationResult] = await Promise.all([
    supabase.from("catalog_product_variants")
      .select("id,product_id,sku,name,option_values,price_override_bdt,sort_order")
      .eq("product_id", productId).order("sort_order"),
    supabase.from("catalog_product_specifications")
      .select("id,product_id,label,value,unit,sort_order")
      .eq("product_id", productId).order("sort_order"),
  ]);

  const variants: ProductVariant[] = variantResult.error ? [] : (variantResult.data ?? []).flatMap((row) => {
    const optionValues = row.option_values && typeof row.option_values === "object" && !Array.isArray(row.option_values)
      ? Object.fromEntries(Object.entries(row.option_values as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
      : {};
    const override = row.price_override_bdt === null ? null : Number(row.price_override_bdt);
    if (override !== null && (!Number.isSafeInteger(override) || override <= 0)) return [];
    return [{ id: row.id, sku: row.sku ?? null, name: row.name, optionValues, priceOverrideBdt: override }];
  });

  return {
    variants,
    specifications: specificationResult.error ? [] : specificationResult.data ?? [],
  };
}

export interface PublicCheckoutConfig {
  checkoutEnabled: boolean;
  deliveryZones: Array<{ id: string; code: string; name: string; description: string | null; deliveryChargeBdt: number }>;
  paymentMethods: ConfiguredPaymentMethod[];
}

export async function getPublicCheckoutConfig(): Promise<PublicCheckoutConfig> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return { checkoutEnabled: false, deliveryZones: [], paymentMethods: [] };
  const { data, error } = await supabase.rpc("get_public_checkout_config");
  if (error || !data || typeof data !== "object") {
    return { checkoutEnabled: false, deliveryZones: [], paymentMethods: [] };
  }
  const config = data as Record<string, unknown>;
  const deliveryZones = Array.isArray(config.deliveryZones) ? config.deliveryZones.flatMap((zone) => {
    if (!zone || typeof zone !== "object") return [];
    const row = zone as Record<string, unknown>;
    const charge = Number(row.deliveryChargeBdt);
    if (typeof row.id !== "string" || typeof row.code !== "string" || typeof row.name !== "string" || !Number.isSafeInteger(charge) || charge < 0) return [];
    return [{ id: row.id, code: row.code, name: row.name, description: typeof row.description === "string" ? row.description : null, deliveryChargeBdt: charge }];
  }) : [];
  const paymentMethods = parsePublicPaymentMethods(config.paymentMethods);
  return { checkoutEnabled: config.checkoutEnabled === true, deliveryZones, paymentMethods };
}
