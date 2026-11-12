"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { searchProducts } from "@/lib/catalog/search";
import { SearchIcon, ArrowRightIcon } from "@/components/icons";

export function SearchBox({ products }: { products: readonly Product[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => searchProducts(products, query).slice(0, 5), [products, query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="search-wrap">
      <form action="/shop" role="search" className="search-form" onSubmit={() => setOpen(false)}>
        <SearchIcon className="search-icon" />
        <input
          aria-label="Search products"
          name="query"
          type="search"
          placeholder="Search components, boards, sensors..."
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          autoComplete="off"
        />
        <button type="submit" className="search-submit" aria-label="Submit search"><ArrowRightIcon /></button>
      </form>
      {open && hasQuery && (
        <div className="search-popover" role="status">
          {suggestions.length > 0 ? (
            <>
              <p className="popover-label">Suggested products</p>
              {suggestions.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="suggestion" onClick={() => setOpen(false)}>
                  <span>{product.name}</span><span>{product.sku}</span>
                </Link>
              ))}
              <Link className="view-results" href={`/shop?query=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}>View all results <ArrowRightIcon /></Link>
            </>
          ) : (
            <div className="search-empty"><strong>No matching products yet</strong><span>The catalogue is being populated from verified inventory. Try again after products are added.</span></div>
          )}
        </div>
      )}
    </div>
  );
}
