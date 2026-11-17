import type { Metadata } from "next";
import { getStorefrontCatalogue } from "@/data/storefront";
import { ShopCatalogue } from "@/components/shop-catalogue";

export const metadata: Metadata = { title: "Shop electronics components" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [params, catalogue] = await Promise.all([searchParams, getStorefrontCatalogue(24)]);
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const initialCategory = typeof params.category === "string" ? params.category : "";
  const hasInitialFilters = Boolean(initialQuery || initialCategory);
  return (
    <ShopCatalogue
      categories={catalogue.categories}
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      initialProducts={hasInitialFilters ? [] : catalogue.products}
      initialHasMore={!hasInitialFilters && catalogue.products.length === 24}
      initialConfigured={catalogue.connected}
    />
  );
}
