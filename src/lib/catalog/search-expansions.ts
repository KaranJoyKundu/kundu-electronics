/**
 * Expand only the single-letter "b" search with the common Breadboard term.
 * One-character searches are intentionally supported by the storefront, and
 * this keeps a useful, customer-relevant result visible alongside broad matches.
 */
export function getRelatedCatalogSearchTerms(query: string): string[] {
  return query.trim().toLowerCase() === "b" ? ["breadboard"] : [];
}
