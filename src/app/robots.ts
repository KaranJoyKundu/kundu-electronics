import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kundu-electronics.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/products/", "/gallery", "/image-credits", "/about", "/contact", "/support", "/shipping-returns"],
      disallow: ["/admin/", "/api/", "/cart", "/orders/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
