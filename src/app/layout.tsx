import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedProducts } from "@/data/catalogue";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kundu Electronics | Electronics Components in Khulna",
    template: "%s | Kundu Electronics",
  },
  description: "Explore electronics components and tools from Kundu Electronics in Khulna, Bangladesh.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = getPublishedProducts();
  return (
    <html lang="en-BD">
      <body>
        <SiteHeader products={products} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
