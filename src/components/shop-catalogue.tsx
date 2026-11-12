"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Product } from "@/lib/catalog/types";
import { filterProducts } from "@/lib/catalog/search";
import { formatPriceBdt } from "@/lib/format";

export function ShopCatalogue({ products, categories, initialQuery, initialCategory }: {
  products: readonly Product[]; categories: readonly Category[]; initialQuery: string; initialCategory: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("200");
  const [sort, setSort] = useState<"relevance" | "name-asc" | "price-asc" | "price-desc">("relevance");
  const filtered = useMemo(() => filterProducts(products, {
    query, categorySlug: category || undefined,
    minPrice: minPrice === "" ? null : Number(minPrice),
    maxPrice: maxPrice === "" ? null : Number(maxPrice), sort,
  }), [products, query, category, minPrice, maxPrice, sort]);

  function clearFilters() { setQuery(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setSort("relevance"); }

  return (
    <section className="container shop-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></div>
      <div className="page-heading-row"><div><span className="section-kicker">THE CATALOGUE</span><h1>Shop components</h1><p>Search and refine the customer-facing catalogue.</p></div><span className="result-count">{filtered.length} PRODUCTS</span></div>
      <div className="shop-layout">
        <aside className="filter-panel" aria-label="Product filters"><div className="filter-heading"><h2>Filters</h2><button type="button" onClick={clearFilters}>Clear all</button></div>
          <label className="filter-label" htmlFor="shop-search">Search</label><input id="shop-search" className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, SKU or keyword" />
          <label className="filter-label" htmlFor="category-filter">Category</label><select id="category-filter" className="field" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select>
          <div className="filter-label">Price range (BDT)</div><div className="price-inputs"><label><span>Min ৳</span><input className="field" type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label><label><span>Max ৳</span><input className="field" type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label></div>
          <p className="filter-hint">Price limits are inclusive. Only verified selling prices are used.</p>
        </aside>
        <div className="shop-results"><div className="results-toolbar"><span>{filtered.length} results</span><label>Sort by <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="relevance">Relevance</option><option value="name-asc">Name A–Z</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
          {filtered.length === 0 ? <div className="empty-catalogue"><div className="empty-catalogue-icon">＋</div><span className="state-tag">NO PUBLISHED PRODUCTS</span><h2>{products.length === 0 ? "The catalogue is being prepared." : "No products match these filters."}</h2><p>{products.length === 0 ? "We are setting up the catalogue from the shop’s verified inventory and selling prices. No sample prices or stock claims are displayed." : "Try changing your search or price range, or clear the filters to see all products."}</p><button className="button button-dark" type="button" onClick={clearFilters}>Clear filters</button></div> : <div className="product-grid">{filtered.map((product) => <Link href={`/products/${product.slug}`} key={product.id} className="product-tile"><div className="product-tile-image">{product.images[0] ? <img src={product.images[0].src} alt={product.images[0].alt} /> : <span>IMAGE PENDING</span>}</div><span className="product-tile-sku">{product.sku}</span><strong>{product.name}</strong><span>{formatPriceBdt(product.priceBdt)}</span></Link>)}</div>}
        </div>
      </div>
    </section>
  );
}
