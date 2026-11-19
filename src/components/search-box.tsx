"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon, ArrowRightIcon } from "@/components/icons";
import { parseSearchSuggestions, type SearchSuggestion } from "@/lib/catalog/response";

type Suggestion = SearchSuggestion;
type SearchResult = { query: string; suggestions: Suggestion[] };

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const currentResult = searchResult?.query === normalizedQuery ? searchResult : null;
  const suggestions = currentResult?.suggestions ?? [];
  const loading = hasQuery && currentResult === null;
  const allResultsIndex = suggestions.length;

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
          if (!controller.signal.aborted) {
            setSearchResult({ query: normalized, suggestions: products });
            setActiveIndex(-1);
          }
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
          setSearchResult({ query: normalized, suggestions: [] });
          setActiveIndex(-1);
        });
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || !hasQuery || loading) return;

    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => current < allResultsIndex ? current + 1 : 0);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => current > 0 ? current - 1 : allResultsIndex);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      if (activeIndex === allResultsIndex) {
        router.push(`/shop?query=${encodeURIComponent(normalizedQuery)}`);
      } else {
        const selected = suggestions[activeIndex];
        if (selected) router.push(`/products/${selected.slug}`);
      }
      setOpen(false);
    }
  }

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
          aria-activedescendant={activeIndex >= 0 ? `product-search-option-${activeIndex}` : undefined}
          name="query"
          type="search"
          placeholder="Search components, boards, sensors..."
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => { setOpen(false); setActiveIndex(-1); }, 120)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button type="submit" className="search-submit" aria-label="Submit search"><ArrowRightIcon /></button>
      </form>
      {open && hasQuery && (
        <div id="product-search-suggestions" className="search-popover" role="listbox" aria-label="Product search suggestions">
          {loading ? <div className="search-empty" role="status"><span>Searching the catalogue…</span></div> : suggestions.length > 0 ? (
            <>
              <div className="popover-label" role="presentation">Suggested products</div>
              {suggestions.map((product, index) => (
                <Link
                  key={product.id}
                  id={`product-search-option-${index}`}
                  href={`/products/${product.slug}`}
                  className="suggestion"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={() => setOpen(false)}
                >
                  <span>{product.name}</span><span>{product.sku || product.category}</span>
                </Link>
              ))}
              <Link
                id={`product-search-option-${allResultsIndex}`}
                className="view-results"
                role="option"
                aria-selected={activeIndex === allResultsIndex}
                href={`/shop?query=${encodeURIComponent(query)}`}
                onMouseEnter={() => setActiveIndex(allResultsIndex)}
                onMouseDown={() => setOpen(false)}
              >View all results <ArrowRightIcon /></Link>
            </>
          ) : (
            <div className="search-empty" role="status"><strong>No matching products yet</strong><span>The catalogue may not contain a published match for this search.</span></div>
          )}
        </div>
      )}
    </div>
  );
}
