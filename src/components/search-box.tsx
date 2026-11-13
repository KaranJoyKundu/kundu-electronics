"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon, ArrowRightIcon } from "@/components/icons";
import { parseSearchSuggestions, type SearchSuggestion } from "@/lib/catalog/response";

type Suggestion = SearchSuggestion;
type SearchResult = { query: string; suggestions: Suggestion[] };

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const currentResult = searchResult?.query === normalizedQuery ? searchResult : null;
  const suggestions = currentResult?.suggestions ?? [];
  const loading = hasQuery && currentResult === null;

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch(`/api/catalog/search?query=${encodeURIComponent(normalized)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Search request failed");
          const result: unknown = await response.json();
          const products = parseSearchSuggestions(result);
          if (!controller.signal.aborted) setSearchResult({ query: normalized, suggestions: products });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
          setSearchResult({ query: normalized, suggestions: [] });
        });
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
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
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
              <div className="popover-label" role="presentation">Suggested products</div>
              {suggestions.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="suggestion" role="option" onMouseDown={() => setOpen(false)}>
                  <span>{product.name}</span><span>{product.sku || product.category}</span>
                </Link>
              ))}
              <Link className="view-results" role="option" aria-selected={false} href={`/shop?query=${encodeURIComponent(query)}`} onMouseDown={() => setOpen(false)}>View all results <ArrowRightIcon /></Link>
            </>
          ) : (
            <div className="search-empty"><strong>No matching products yet</strong><span>The catalogue may not contain a published match for this search.</span></div>
          )}
        </div>
      )}
    </div>
  );
}
