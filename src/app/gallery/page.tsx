import type { Metadata } from "next";
import Link from "next/link";
import { OwnerProductGallery } from "@/components/owner-product-gallery";
import { getStorefrontCatalogue } from "@/data/storefront";
import "./gallery.css";

export const metadata: Metadata = {
  title: "Product photo gallery",
  description: "Browse product photographs from owner-provided and reuse-permitted sources, with links to Kundu Electronics listings.",
};

export default async function GalleryPage() {
  const catalogue = await getStorefrontCatalogue(211, 1);
  const products = catalogue.products;
  return (
    <div className="owner-gallery-page">
      <div className="container">
        <div className="owner-gallery-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Photo gallery</span></div>
        <header className="owner-gallery-heading">
          <span className="section-kicker">KUNDU ELECTRONICS / PRODUCT PREVIEWS</span>
          <h1>Parts for your <em>next build.</em></h1>
          <p>Browse every published catalogue product with its individually matched photograph. The complete product set contains 211 items across 17 categories.</p>
          <p><Link className="underlined-link" href="/image-credits">View photo sources and credits →</Link></p>
          <div className="owner-gallery-notice"><strong>Stock can change</strong><span>Stock indicators come from the shop inventory workbook. Please message us to reconfirm availability before travelling or ordering.</span></div>
        </header>
        <OwnerProductGallery products={products} />
        <div className="owner-gallery-footer">
          <div><span className="section-kicker">CAN&apos;T FIND WHAT YOU NEED?</span><h2>Tell us what you&apos;re building.</h2><p>Ask the shop about a component, a compatible alternative, or help choosing parts.</p></div>
          <Link className="button button-primary" href="https://wa.me/8801570263442?text=Hello%20Kundu%20Electronics%2C%20I%20need%20help%20finding%20electronics%20components." target="_blank" rel="noopener noreferrer">Chat on WhatsApp <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  );
}
