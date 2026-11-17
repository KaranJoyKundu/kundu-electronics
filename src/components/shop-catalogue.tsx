"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category, Product } from "@/lib/catalog/types";
import { formatPriceBdt } from "@/lib/format";
import { ProductPhoto } from "@/components/product-photo";

type Sort = "relevance" | "name-asc" | "price-asc" | "price-desc" | "newest";

const availabilityLabels: Record<string, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  availability_on_request: "Ask about availability",
  backorder: "Backorder",
  build_to_order: "Build to order",
  discontinued: "Discontinued",
  unknown: "Availability to confirm",
};

export function ShopCatalogue({ categories, initialQuery, initialCategory, initialPage, initialProducts, initialHasMore, initialTotalCount, initialConfigured }: {
  categories: readonly Category[];
  initialPage: number;
  initialQuery: string;
  initialCategory: string;
  initialProducts: Product[];
  initialHasMore: boolean;
  initialTotalCount: number;
  initialConfigured: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<Sort>("relevance");
  const [page, setPage] = useState(initialPage);
  const hasInitialResults = initialQuery === "" && initialCategory === "" && initialProducts.length > 0;
  const skipInitialRequest = useRef(hasInitialResults);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [configured, setConfigured] = useState(initialConfigured);
  const [loading, setLoading] = useState(!hasInitialResults);
  const [failed, setFailed] = useState(false);
  const filters = useMemo(() => ({ query: query.trim(), category, minPrice, maxPrice, sort, page }), [query, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    if (skipInitialRequest.current) {
      skipInitialRequest.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      const params = new URLSearchParams({ page: String(filters.page), sort: filters.sort });
      if (filters.query) params.set("query", filters.query);
      if (filters.category) params.set("category", filters.category);
      if (filters.minPrice !== "") params.set("min", filters.minPrice);
      if (filters.maxPrice !== "") params.set("max", filters.maxPrice);
      try {
        const response = await fetch(`/api/catalog/products?${params.toString()}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("catalogue request failed");
        const payload = await response.json() as { products?: Product[]; hasMore?: boolean; totalCount?: number; configured?: boolean };
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setHasMore(payload.hasMore === true);
        if (typeof payload.totalCount === "number" && Number.isSafeInteger(payload.totalCount) && payload.totalCount >= 0) setTotalCount(payload.totalCount);
        setConfigured(payload.configured !== false);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setFailed(true);
        setProducts([]);
        setHasMore(false);
        setTotalCount(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (page > 1) url.searchParams.set("page", String(page));
    else url.searchParams.delete("page");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [page]);

  function resetPage(change: () => void) { change(); setPage(1); }
  function clearFilters() {
    setQuery(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setSort("relevance"); setPage(1);
  }
  const priceInvalid = minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);
  const totalPages = Math.max(1, Math.ceil(totalCount / 24));
  const pageNumbers = totalPages <= 12
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : Array.from(new Set([1, ...(page > 2 ? [page - 1] : []), page, ...(page < totalPages - 1 ? [page + 1] : []), totalPages])).sort((a, b) => a - b);

  function renderPagination(position: "top" | "bottom") {
    if (loading || priceInvalid || failed || !configured || totalPages <= 1) return null;
    return (
      <nav className={`catalogue-pagination catalogue-pagination-${position}`} aria-label={"Catalogue pagination, page " + page}>
        <button className="button button-outline" type="button" disabled={page === 1}
          aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
        <div className="catalogue-page-numbers">
          {pageNumbers.map((pageNumber, index) => (
            <span className="catalogue-page-number-wrap" key={pageNumber}>
              {index > 0 && pageNumber - pageNumbers[index - 1] > 1 ? <span className="catalogue-page-ellipsis" aria-hidden="true">…</span> : null}
              <button type="button" className="catalogue-page-number" aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => setPage(pageNumber)}>{pageNumber}</button>
            </span>
          ))}
        </div>
        <span className="catalogue-pagination-current" aria-live="polite">Page {page} of {totalPages}</span>
        <button className="button button-outline" type="button" disabled={page >= totalPages}
          aria-label="Next page" onClick={() => setPage((current) => current + 1)}>Next</button>
      </nav>
    );
  }


  return (
    <section className="container shop-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></div>
      <div className="page-heading-row"><div><span className="section-kicker">THE CATALOGUE</span><h1>Shop components</h1><p>Search and refine the customer-facing catalogue.</p></div><span className="result-count">{loading ? "LOADING" : `PAGE ${page} / ${totalPages}`}</span></div>
      <div className="shop-layout">
        <aside className="filter-panel" aria-label="Product filters"><div className="filter-heading"><h2>Filters</h2><button type="button" onClick={clearFilters}>Clear all</button></div>
          <label className="filter-label" htmlFor="shop-search">Search</label><input id="shop-search" className="field" value={query} onChange={(event) => resetPage(() => setQuery(event.target.value))} placeholder="Name, SKU or keyword" />
          <label className="filter-label" htmlFor="category-filter">Category</label><select id="category-filter" className="field" value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select>
          <div className="filter-label">Price range (BDT)</div><div className="price-inputs"><label><span>Min ৳</span><input className="field" type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => resetPage(() => setMinPrice(event.target.value))} /></label><label><span>Max ৳</span><input className="field" type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => resetPage(() => setMaxPrice(event.target.value))} /></label></div>
          <button className="price-preset" type="button" onClick={() => { setMinPrice("0"); setMaxPrice("200"); setPage(1); }}>Use ৳0–৳200 range</button>
          <p className="filter-hint">Price limits are inclusive. No price limit is applied until you enter one or choose a range.</p>
        </aside>
        <div className="shop-results"><div className="results-toolbar"><span>{loading ? "Loading products…" : `Showing ${products.length} of ${totalCount} products · Page ${page} of ${totalPages}`}</span><label>Sort by <select value={sort} onChange={(event) => resetPage(() => setSort(event.target.value as Sort))}><option value="relevance">Relevance</option><option value="name-asc">Name A–Z</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="newest">Newest</option></select></label></div>
          {renderPagination("top")}
          {priceInvalid ? <div className="empty-catalogue"><h2>Check your price range</h2><p>The minimum cannot be greater than the maximum.</p></div>
            : failed ? <div className="empty-catalogue"><h2>Catalogue temporarily unavailable</h2><p>Please try again. No cached or fabricated product data is being shown.</p><button className="button button-dark" onClick={() => setPage(1)} type="button">Retry</button></div>
            : !configured ? <div className="empty-catalogue"><h2>The catalogue is not connected yet.</h2><p>Connect the approved database to display published products.</p></div>
            : loading ? <div className="empty-catalogue" aria-live="polite"><h2>Loading catalogue…</h2></div>
            : products.length === 0 ? <div className="empty-catalogue"><div className="empty-catalogue-icon">＋</div><span className="state-tag">NO PUBLISHED PRODUCTS</span><h2>{page > 1 ? "No more products on this page." : "The catalogue is being prepared."}</h2><p>{page > 1 ? "Return to the previous page." : "Product listings will appear here once the inventory and customer-facing selling prices have been reviewed and added."}</p><button className="button button-dark" type="button" onClick={page > 1 ? () => setPage(page - 1) : clearFilters}>{page > 1 ? "Previous page" : "Clear filters"}</button></div>
            : <div className="product-grid">{products.map((product) => <Link href={`/products/${product.slug}`} key={product.id} className="product-tile"><div className="product-tile-image">{product.images[0] ? <Image src={product.images[0].src} alt={product.images[0].alt} width={480} height={360} unoptimized /> : <ProductPhoto name={product.name} sku={product.sku} category={product.categorySlug} />}</div><span className="product-tile-sku">{product.sku}</span><strong>{product.name}</strong><span className="product-tile-price">{formatPriceBdt(product.priceBdt)}</span><span className={`product-tile-availability product-tile-availability-${product.availability}`}>{availabilityLabels[product.availability] ?? availabilityLabels.unknown}</span></Link>)}</div>}
          {renderPagination("bottom")}
        </div>
      </div>
    </section>
  );
}
