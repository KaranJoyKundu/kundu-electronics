import { NextResponse, type NextRequest } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { jsonError } from "@/lib/security/request";
import { parseCatalogSearchRows } from "@/lib/supabase/catalog-search";
import { parseCatalogProductsQuery } from "@/lib/catalog/query";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;


export async function GET(request: NextRequest) {
  const parsedQuery = parseCatalogProductsQuery(request.nextUrl.searchParams);
  if (!parsedQuery.ok) return jsonError(400, parsedQuery.error);
  const { query, category, minPrice, maxPrice, sort, page } = parsedQuery.value;

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ products: [], hasMore: false, configured: false }, { headers: { "Cache-Control": "no-store" } });

  const [{ data, error }, { data: countData, error: countError }] = await Promise.all([
    supabase.rpc("search_catalog_products", {
      p_query: query,
      p_category_slug: category || null,
      p_min_price_bdt: minPrice,
      p_max_price_bdt: maxPrice,
      p_sort: sort.replaceAll("-", "_"),
      p_limit: PAGE_SIZE + 1,
      p_offset: (page - 1) * PAGE_SIZE,
    }),
    supabase.rpc("count_catalog_products", {
      p_query: query,
      p_category_slug: category || null,
      p_min_price_bdt: minPrice,
      p_max_price_bdt: maxPrice,
    }),
  ]);
  if (error || countError) return jsonError(503, "The catalogue is temporarily unavailable.");

  const totalCount = Number(countData);
  if (!Number.isSafeInteger(totalCount) || totalCount < 0) return jsonError(503, "The catalogue is temporarily unavailable.");
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rows = parseCatalogSearchRows(data);
  const hasMore = page < totalPages;
  const visibleRows = rows.slice(0, PAGE_SIZE);
  const paths = visibleRows.flatMap((row) => typeof row.primary_image_path === "string" ? [row.primary_image_path] : []);
  const imageUrls = new Map<string, string>();
  if (paths.length) {
    const signed = await supabase.storage.from("product-images").createSignedUrls(paths, 60 * 60);
    for (const item of signed.data ?? []) if (item.path && item.signedUrl) imageUrls.set(item.path, item.signedUrl);
  }

  const products = visibleRows.map((row) => ({
    id: row.id,
    sku: row.sku ?? "",
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? undefined,
    summary: row.short_description ?? undefined,
    priceBdt: Number(row.price_bdt),
    categorySlug: row.category_slug,
    availability: row.public_availability,
    images: typeof row.primary_image_path === "string" && imageUrls.has(row.primary_image_path)
      ? [{ src: imageUrls.get(row.primary_image_path)!, alt: row.name }]
      : [],
    published: true,
    updatedAt: "",
  }));

  return NextResponse.json({ products, hasMore, page, totalCount, totalPages, configured: true }, {
    headers: { "Cache-Control": "no-store" },
  });
}
