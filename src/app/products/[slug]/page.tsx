import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductPurchaseControl } from "@/components/cart/product-purchase-control";
import { notFound } from "next/navigation";
import { getPublicCheckoutConfig, getStorefrontProduct, getStorefrontProductDetails } from "@/data/storefront";
import { formatPriceBdt } from "@/lib/format";
import { ProductPhoto } from "@/components/product-photo";

const availabilityLabels: Record<string, string> = {
  unknown: "Availability not confirmed",
  availability_on_request: "Contact us to confirm availability",
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  backorder: "Backorder",
  discontinued: "Discontinued",
  build_to_order: "Build to order",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) return { title: "Product not found" };

  const description = product.summary
    ?? `View ${product.name} (${product.sku}) in the Kundu Electronics catalogue. Confirm the latest price, exact version and availability with the shop before ordering.`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Kundu Electronics`,
      description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();
  const [details, checkout] = await Promise.all([getStorefrontProductDetails(product.id), getPublicCheckoutConfig()]);
  const enquiryMessage = encodeURIComponent(`Hello Kundu Electronics, I am interested in ${product.name} (${product.sku || product.id}). Could you confirm current availability?`);
  const whatsappUrl = `https://wa.me/8801570263442?text=${enquiryMessage}`;

  return (
    <section className="container simple-page product-page">
      <div className="breadcrumb"><a href="/shop">Shop</a><span>/</span><span>{product.name}</span></div>
      <div className="product-detail-grid">
        <div className="product-gallery">
          {product.images.length > 0 ? product.images.map((image, index) => (
            <div className="product-detail-image" key={`${image.src}-${index}`}>
              <Image src={image.src} alt={image.alt} width={900} height={900} unoptimized />
            </div>
          )) : <div className="product-detail-image"><ProductPhoto name={product.name} sku={product.sku} category={product.categorySlug} /></div>}
        </div>
        <div className="product-information">
          <span className="section-kicker">{product.categorySlug.replaceAll("-", " ")}</span>
          <h1>{product.name}</h1>
          {product.sku ? <p className="product-sku">SKU: {product.sku}</p> : null}
          <p className="product-price">{formatPriceBdt(product.priceBdt)}</p>
          <p className="product-availability">{availabilityLabels[product.availability] ?? availabilityLabels.unknown}</p>
          {product.summary ? <p className="simple-lead">{product.summary}</p> : null}
          {product.description ? <p>{product.description}</p> : null}
          {!product.summary && !product.description && details.specifications.length === 0 ? (
            <div className="notice-panel product-details-pending">
              <strong>Technical details not published yet</strong>
              <p>Only the basic catalogue information is currently available online. Contact the shop to confirm the exact version, specifications, compatibility and current availability before purchasing.</p>
            </div>
          ) : null}
          <ProductPurchaseControl productId={product.id} basePriceBdt={product.priceBdt} orderable={product.orderable === true} enquiryOnly={!checkout.checkoutEnabled} variants={details.variants} />
          <Link className="button button-outline" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Ask about this product on WhatsApp ↗</Link>
          <p className="product-order-note">Stock status comes from the shop inventory workbook and can change. Please reconfirm availability with the shop before travelling. Inventory counts are not displayed publicly.</p>
          {details.specifications.length > 0 ? <section className="product-detail-section"><h2>Specifications</h2><dl>{details.specifications.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}{item.unit ? ` ${item.unit}` : ""}</dd></div>)}</dl></section> : null}
        </div>
      </div>
    </section>
  );
}
