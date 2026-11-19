import { NextResponse, type NextRequest } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { jsonError } from "@/lib/security/request";
import { parseCatalogSearchRows } from "@/lib/supabase/catalog-search";
import { getRelatedCatalogSearchTerms } from "@/lib/catalog/search-expansions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("query") ?? "").trim();
  if (!query) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "no-store" } });
  if (query.length > 120 || /[\u0000-\u001f]/.test(query)) return jsonError(400, "Search query is invalid.");

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ products: [], configured: false }, { headers: { "Cache-Control": "no-store" } });

  const primary = await supabase.rpc("search_catalog_products", {
    p_query: query,
    p_category_slug: null,
    p_min_price_bdt: null,
    p_max_price_bdt: null,
    p_sort: "relevance",
    p_limit: 8,
    p_offset: 0,
  });
  if (primary.error) return jsonError(503, "Search is temporarily unavailable.");

  const relatedTerms = getRelatedCatalogSearchTerms(query);
  const relatedResults = await Promise.all(relatedTerms.map((term) => supabase.rpc("search_catalog_products", {
    p_query: term,
    p_category_slug: null,
    p_min_price_bdt: null,
    p_max_price_bdt: null,
    p_sort: "relevance",
    p_limit: 2,
    p_offset: 0,
  })));

  // Related matches are placed first, then primary-query matches. IDs are
  // deduplicated so a suggestion is never repeated.
  const rows = [
    ...relatedResults.flatMap((result) => result.error ? [] : parseCatalogSearchRows(result.data)),
    ...parseCatalogSearchRows(primary.data),
  ];
  const seen = new Set<string>();
  const products = rows.flatMap((row) => {
    if (seen.has(row.id)) return [];
    seen.add(row.id);
    return [{
      id: row.id,
      slug: row.slug,
      name: row.name,
      sku: row.sku ?? null,
      category: row.category_slug,
    }];
  }).slice(0, 10);

  return NextResponse.json({ products, configured: true }, { headers: { "Cache-Control": "no-store" } });
}
