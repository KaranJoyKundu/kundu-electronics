"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon, ArrowRightIcon } from "@/components/icons";

type Suggestion = { id: string; slug: string; name: string; sku: string | null; category: string };

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalog/search?query=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Search request failed");
        const result = await response.json() as { products?: Suggestion[] };
        setSuggestions(Array.isArray(result.products) ? result.products : []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="search-wrap">
      <form action="/shop" role="search" className="search-form" onSubmit={() => setOpen(false)}>
        <SearchIcon className="search-icon" />
        <input
          aria-label="Search products"
          aria-controls="product-search-suggestions"
          aria-expanded={open && hasQuery}
          name="query"
          type="search"
          placeholder="Search components, boards, sensors..."
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          autoComplete="off"
        />
        <button type="submit" className="search-submit" aria-label="Submit search"><ArrowRightIcon /></button>
      </form>
      {open && hasQuery && (
        <div id="product-search-suggestions" className="search-popover" role="listbox" aria-label="Product search suggestions">
          {loading ? <div className="search-empty"><span>Searching the catalogue…</span></div> : suggestions.length > 0 ? (
            <>
              <p className="popover-label">Suggested products</p>
              {suggestions.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="suggestion" role="option" onMouseDown={() => setOpen(false)}>
                  <span>{product.name}</span><span>{product.sku || product.category}</span>
                </Link>
              ))}
              <Link className="view-results" href={`/shop?query=${encodeURIComponent(query)}`} onMouseDown={() => setOpen(false)}>View all results <ArrowRightIcon /></Link>
            </>
          ) : (
            <div className="search-empty"><strong>No matching products yet</strong><span>The catalogue may not contain a published match for this search.</span></div>
          )}
        </div>
      )}
    </div>
  );
}
