import Link from "next/link";
import Image from "next/image";
import { HomeIllustration } from "@/components/home-illustration";
import { ArrowRightIcon } from "@/components/icons";
import { getStorefrontCatalogue } from "@/data/storefront";
import { formatPriceBdt } from "@/lib/format";

export default async function HomePage() {
  const { products } = await getStorefrontCatalogue(8);
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> THE COMPONENT WORKBENCH <span className="eyebrow-index">01 / 04</span></div>
            <h1>Make your next idea <em>real.</em></h1>
            <p className="hero-description">A place for the components, boards and tools that turn curiosity into working prototypes.</p>
            <div className="hero-actions">
              <Link href="/shop" className="button button-primary">Explore the catalogue <ArrowRightIcon /></Link>
              <Link href="/support" className="text-link">Need a hand? <ArrowRightIcon /></Link>
            </div>
            <div className="hero-footnote"><span className="status-pip" /> Kundu Electronics <span className="hero-footnote-separator">·</span> Khulna, Bangladesh</div>
          </div>
          <HomeIllustration />
        </div>
        <div className="hero-bottom-rule"><div className="container"><span>COMPONENTS / PROTOTYPING / DISCOVERY</span><span>PARTS / BOARDS / TOOLS</span></div></div>
      </section>

      <section className="intro-section container">
        <div className="section-kicker">01 — START HERE</div>
        <div className="intro-content">
          <div><h2>Good projects start with the <span>right parts.</span></h2></div>
          <div className="intro-aside"><p>Explore the shop catalogue for customer-facing prices and stock statuses from the inventory workbook. Stock can change, so please reconfirm availability with us before visiting.</p><Link href="/shop" className="underlined-link">Visit the catalogue <ArrowRightIcon /></Link></div>
        </div>
      </section>

      <section className="catalogue-state-section">
        <div className="container catalogue-state-grid">
          <div className="section-kicker">02 — THE CATALOGUE</div>
          <div className="catalogue-state-card">
            <div className="state-visual"><div className="state-grid-mark"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><span className="state-visual-label">CATALOGUE / LIVE</span></div>
            <div className="state-copy"><span className="state-tag">LIVE CATALOGUE</span><h2>Find the right part<br />for your next build.</h2><p>Browse components across 17 categories, compare BDT selling prices, and check the workbook-reported stock status. Ask us to reconfirm availability before you travel.</p><Link href="/shop" className="button button-dark">Browse products <ArrowRightIcon /></Link></div>
          </div>
        </div>
      </section>

      <section className="principles-section container">
        <div className="section-kicker">03 — THE KUNDU STANDARD</div>
        <div className="principles-grid">
          <article><span className="principle-number">01</span><h3>Clear product details</h3><p>Technical information will be shown when it is available and verified—not guessed.</p></article>
          <article><span className="principle-number">02</span><h3>Transparent pricing</h3><p>Customer-facing prices will come from the approved selling-price catalogue.</p></article>
          <article><span className="principle-number">03</span><h3>Human payment checks</h3><p>Manual mobile payments will remain pending until the transaction is checked by the shop.</p></article>
        </div>
      </section>

      <section className="help-strip"><div className="container help-strip-inner"><div><span className="section-kicker">04 — NEED SOMETHING?</span><h2>Not sure which part you need?</h2><p>Get product guidance or ask about availability through the shop’s verified contact channels.</p></div><Link href="/contact" className="button button-outline">Contact the shop <ArrowRightIcon /></Link></div></section>

      {products.length > 0 && <section className="container featured-products"><div className="section-heading"><div><span className="section-kicker">SHOP PICKS</span><h2>From the catalogue</h2></div><Link href="/shop" className="underlined-link">View all <ArrowRightIcon /></Link></div><div className="product-preview-grid">{products.slice(0, 4).map((product) => <Link href={`/products/${product.slug}`} key={product.id} className="preview-product"><div className="preview-image">{product.images[0] ? <Image src={product.images[0].src} alt={product.images[0].alt} width={480} height={360} unoptimized /> : <span>IMAGE PENDING</span>}</div><span>{product.name}</span><strong>{formatPriceBdt(product.priceBdt)}</strong></Link>)}</div></section>}
    </>
  );
}
