import { NextResponse, type NextRequest } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { jsonError } from "@/lib/security/request";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;
const SORTS = new Set(["relevance", "name-asc", "price-asc", "price-desc", "newest"]);

function optionalPrice(value: string | null): number | null | undefined {
  if (value === null || value === "") return null;
  if (!/^\d{1,10}$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 1_000_000_000 ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("query") ?? "").trim();
  const category = (params.get("category") ?? "").trim();
  const minPrice = optionalPrice(params.get("min"));
  const maxPrice = optionalPrice(params.get("max"));
  const sort = params.get("sort") ?? "relevance";
  const pageRaw = params.get("page") ?? "1";
  const page = /^\d{1,4}$/.test(pageRaw) ? Number(pageRaw) : 0;

  if (query.length > 120 || /[\u0000-\u001f]/.test(query)) return jsonError(400, "Search query is invalid.");
  if (category && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) || category.length > 120)) return jsonError(400, "Category filter is invalid.");
  if (minPrice === undefined || maxPrice === undefined || (minPrice !== null && maxPrice !== null && minPrice > maxPrice)) return jsonError(400, "Price range is invalid.");
  if (!SORTS.has(sort) || page < 1 || page > 400) return jsonError(400, "Catalogue paging or sorting is invalid.");

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ products: [], hasMore: false, configured: false }, { headers: { "Cache-Control": "no-store" } });

  const { data, error } = await supabase.rpc("search_catalog_products", {
    p_query: query,
    p_category_slug: category || null,
    p_min_price_bdt: minPrice,
    p_max_price_bdt: maxPrice,
    p_sort: sort.replaceAll("-", "_"),
    p_limit: PAGE_SIZE + 1,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) return jsonError(503, "The catalogue is temporarily unavailable.");

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
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

  return NextResponse.json({ products, hasMore, page, configured: true }, {
    headers: { "Cache-Control": "no-store" },
  });
}
