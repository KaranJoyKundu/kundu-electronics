import type { Metadata } from "next";
import { getPublishedProducts, getPublishedCategories } from "@/data/catalogue";
import { ShopCatalogue } from "@/components/shop-catalogue";

export const metadata: Metadata = { title: "Shop electronics components" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <ShopCatalogue products={getPublishedProducts()} categories={getPublishedCategories()} initialQuery={typeof params.query === "string" ? params.query : ""} initialCategory={typeof params.category === "string" ? params.category : ""} />;
}
