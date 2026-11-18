import type { Metadata } from "next";
import { getStorefrontCatalogue } from "@/data/storefront";
import { ShopCatalogue } from "@/components/shop-catalogue";

export const metadata: Metadata = { title: "Shop electronics components" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const initialCategory = typeof params.category === "string" ? params.category : "";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const initialPage = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 400 ? requestedPage : 1;
  const hasInitialFilters = Boolean(initialQuery || initialCategory);
  const catalogue = await getStorefrontCatalogue(24, initialPage);
  const canUseServerProducts = !hasInitialFilters;
  return (
    <ShopCatalogue
      categories={catalogue.categories}
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      initialPage={initialPage}
      initialProducts={canUseServerProducts ? catalogue.products : []}
      initialHasMore={canUseServerProducts && initialPage * 24 < catalogue.totalCount}
      initialTotalCount={canUseServerProducts ? catalogue.totalCount : 0}
      initialConfigured={catalogue.connected}
    />
  );
}
