import { NextResponse, type NextRequest } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { jsonError } from "@/lib/security/request";
import { parseCatalogSearchRows } from "@/lib/supabase/catalog-search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("query") ?? "").trim();
  if (!query) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "no-store" } });
  if (query.length > 120 || /[\u0000-\u001f]/.test(query)) return jsonError(400, "Search query is invalid.");

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ products: [], configured: false }, { headers: { "Cache-Control": "no-store" } });

  const { data, error } = await supabase.rpc("search_catalog_products", {
    p_query: query,
    p_category_slug: null,
    p_min_price_bdt: null,
    p_max_price_bdt: null,
    p_sort: "relevance",
    p_limit: 6,
    p_offset: 0,
  });
  if (error) return jsonError(503, "Search is temporarily unavailable.");

  const products = parseCatalogSearchRows(data).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku ?? null,
    category: row.category_slug,
  }));
  return NextResponse.json({ products, configured: true }, { headers: { "Cache-Control": "no-store" } });
}
