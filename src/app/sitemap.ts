import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kundu-electronics.vercel.app").replace(/\/$/, "");
const staticPaths = ["", "/shop", "/gallery", "/about", "/contact", "/support", "/shipping-returns"] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  const supabase = createPublicSupabaseClient();
  if (!supabase) return fixedPages;

  const { data, error } = await supabase
    .from("catalog_products")
    .select("slug,published_at")
    .order("slug")
    .limit(1000);

  if (error || !data) return fixedPages;

  const productPages: MetadataRoute.Sitemap = data.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.published_at ? new Date(product.published_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...fixedPages, ...productPages];
}
