import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { ProductPhoto } from "@/components/product-photo";
import { formatPriceBdt } from "@/lib/format";

const availabilityLabels: Record<string, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  availability_on_request: "Availability to confirm",
  unknown: "Availability to confirm",
  backorder: "Backorder",
  discontinued: "Discontinued",
  build_to_order: "Build to order",
};

export function OwnerProductGallery({ products }: { products: readonly Product[] }) {
  return (
    <div className="owner-gallery-grid">
      {products.map((product) => {
        const message = "Hello Kundu Electronics, I am interested in " + product.name + " (" + product.sku + "). Could you confirm the current selling price and availability?";
        const contactUrl = "https://wa.me/8801570263442?text=" + encodeURIComponent(message);
        return (
          <article className="owner-gallery-card" key={product.id}>
            <Link className="owner-gallery-image" href={"/products/" + product.slug} aria-label={"View " + product.name}>
              <ProductPhoto sku={product.sku} name={product.name} category={product.categorySlug} />
            </Link>
            <div className="owner-gallery-copy">
              <span className="owner-gallery-category">{product.categorySlug.replaceAll("-", " ")}</span>
              <h2>{product.name}</h2>
              <span className="owner-gallery-id">REF. {product.sku}</span>
              <strong className="owner-gallery-price">{formatPriceBdt(product.priceBdt)}</strong>
              <span className={"owner-gallery-stock owner-gallery-stock-" + product.availability}>
                {availabilityLabels[product.availability] ?? availabilityLabels.unknown}
              </span>
              <Link className="owner-gallery-contact" href={"/products/" + product.slug}>View product details <span aria-hidden="true">→</span></Link>
              <Link className="owner-gallery-contact" href={contactUrl} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
