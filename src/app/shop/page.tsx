import type { Metadata } from "next";
import { getPublishedProducts, getPublishedCategories } from "@/data/catalogue";
import { ShopCatalogue } from "@/components/shop-catalogue";

export const metadata: Metadata = { title: "Shop electronics components" };

type SearchParams = Promise<{ query?: string; category?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <ShopCatalogue products={getPublishedProducts()} categories={getPublishedCategories()} initialQuery={params.query ?? ""} initialCategory={params.category ?? ""} />;
}
