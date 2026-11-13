export type CatalogSort = "relevance" | "name-asc" | "price-asc" | "price-desc" | "newest";

export interface CatalogProductsQuery {
  query: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: CatalogSort;
  page: number;
}

export type CatalogQueryResult =
  | { ok: true; value: CatalogProductsQuery }
  | { ok: false; error: string };

const SORTS: readonly string[] = ["relevance", "name-asc", "price-asc", "price-desc", "newest"];

function isCatalogSort(value: string): value is CatalogSort {
  return SORTS.includes(value);
}

function optionalPrice(value: string | null): number | null | undefined {
  if (value === null || value === "") return null;
  if (!/^\d{1,10}$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 1_000_000_000 ? parsed : undefined;
}

export function parseCatalogProductsQuery(params: URLSearchParams): CatalogQueryResult {
  const query = (params.get("query") ?? "").trim();
  const category = (params.get("category") ?? "").trim();
  const minPrice = optionalPrice(params.get("min"));
  const maxPrice = optionalPrice(params.get("max"));
  const sort = params.get("sort") ?? "relevance";
  const pageRaw = params.get("page") ?? "1";
  const page = /^\d{1,4}$/.test(pageRaw) ? Number(pageRaw) : 0;

  if (query.length > 120 || /[\u0000-\u001f]/.test(query)) return { ok: false, error: "Search query is invalid." };
  if (category && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) || category.length > 120)) {
    return { ok: false, error: "Category filter is invalid." };
  }
  if (minPrice === undefined || maxPrice === undefined || (minPrice !== null && maxPrice !== null && minPrice > maxPrice)) {
    return { ok: false, error: "Price range is invalid." };
  }
  if (!isCatalogSort(sort) || page < 1 || page > 400) {
    return { ok: false, error: "Catalogue paging or sorting is invalid." };
  }

  return {
    ok: true,
    value: { query, category, minPrice, maxPrice, sort, page },
  };
}
