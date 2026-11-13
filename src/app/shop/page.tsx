import type { Metadata } from "next";
import { getStorefrontCategories } from "@/data/storefront";
import { ShopCatalogue } from "@/components/shop-catalogue";

export const metadata: Metadata = { title: "Shop electronics components" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [params, categories] = await Promise.all([searchParams, getStorefrontCategories()]);
  return <ShopCatalogue categories={categories} initialQuery={typeof params.query === "string" ? params.query : ""} initialCategory={typeof params.category === "string" ? params.category : ""} />;
}
