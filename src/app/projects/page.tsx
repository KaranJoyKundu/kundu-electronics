import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProjectArtwork, type ProjectKind } from "@/components/project-artwork";
import { ProductPurchaseControl } from "@/components/cart/product-purchase-control";
import { ProductPhoto } from "@/components/product-photo";
import { getPublicCheckoutConfig, getStorefrontCatalogue } from "@/data/storefront";
import { formatPriceBdt } from "@/lib/format";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "Projects & robot kits",
  description: "Explore Kundu Electronics robot builds and complete line follower, soccer bot and RC speed battle kits.",
};

const projectTypes: Array<{ id: string; kind: ProjectKind; title: string; summary: string; detail: string; destination: string; external?: string }> = [
  { id: "bee", kind: "bee", title: "Bee Biped Robot", summary: "A working Bluetooth-controlled biped robot with a 3D-printed body.", detail: "Built around an Arduino Nano, six SG90 servos, an HC-05 Bluetooth module, an HC-SR04 ultrasonic sensor and a MAX7219 8×8 LED-matrix face. The prototype was developed as a hands-on learning demonstration.", destination: "/projects/bee-biped", external: "https://github.com/KaranJoyKundu/bee-biped-robot" },
  { id: "lfr", kind: "lfr", title: "Line Following Robot", summary: "Three complete kit tiers for an autonomous line-following build.", detail: "Choose an entry, competitive or elite configuration. Each package includes the components and quantities listed in the supplied kit specification.", destination: "/projects/line-follower" },
  { id: "soccerbot", kind: "soccerbot", title: "Soccer Bot", summary: "A three-tier kit range for a student soccer robot.", detail: "Start with the Budget Scrapper, move up to the Precision Striker, or choose the Optimized Juggernaut.", destination: "/projects/soccer-bot" },
  { id: "rc", kind: "rc", title: "RC Speed Battle", summary: "Robot and remote-controller components packaged together.", detail: "Each tier includes the bot and matching remote components, based on the supplied RC Speed Battle parts list.", destination: "/projects/rc-speed-battle" },
  { id: "drone", kind: "drone", title: "Drone Projects", summary: "A custom project enquiry—not a pre-priced kit.", detail: "Tell me your intended build, requirements and budget. There is no published drone BOM or package price yet, so I can help scope the parts before quoting.", destination: "/projects/drone" },
];

const kitGroups = [
  { id: "lfr", title: "Line Following Robot kits", intro: "Choose the build level that fits your experience and competition goals.", skus: ["LFR-T1","LFR-T2","LFR-T3"] },
  { id: "soccerbot", title: "Soccer Bot kits", intro: "Three complete packages, from a budget build to a higher-power configuration.", skus: ["SB-T1","SB-T2","SB-T3"] },
  { id: "rc", title: "RC Speed Battle kits", intro: "Each price includes the robot and its matching controller components.", skus: ["RC-T1","RC-T2","RC-T3"] },
];

export default async function ProjectsPage() {
  const [catalogue, checkout] = await Promise.all([getStorefrontCatalogue(250, 1), getPublicCheckoutConfig()]);
  const bySku = new Map(catalogue.products.map((product) => [product.sku, product]));
  const beeParts = [
    { sku: "P021", name: "Arduino Nano", quantity: 1, role: "Main controller" },
    { sku: "P037", name: "SG90 micro servo", quantity: 6, role: "Legs, feet and arms" },
    { sku: "P031", name: "MAX7219 8×8 LED matrix", quantity: 1, role: "Expressions and scrolling text" },
    { sku: "P175", name: "HC-05 Bluetooth module", quantity: 1, role: "Wireless command link" },
    { sku: "P036", name: "HC-SR04 ultrasonic sensor", quantity: 1, role: "Distance readout" },
    { sku: "P181", name: "Sunfort 18650 battery", quantity: 2, role: "Parallel battery supply" },
  ];
  const beeKnownSubtotal = beeParts.reduce((sum, part) => {
    const product = bySku.get(part.sku);
    return sum + (product?.priceBdt ?? 0) * part.quantity;
  }, 0);


  return (
    <section className="container simple-page projects-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Projects</span></div>
      <header className="projects-page-heading">
        <span className="section-kicker">MAKE YOUR NEXT IDEA REAL</span>
        <h1>Projects, prototypes <em>& robot kits.</em></h1>
        <p className="simple-lead">Stuck on a project or close to a deadline? See what I have built, pick a complete kit, or ask for help planning your own idea.</p>
      </header>
      <div className="projects-showcase-grid">
        {projectTypes.map((project) => (
          <article className="project-detail-card" id={project.id} key={project.id}>
            <Link className="project-card-art-link" href={project.destination} aria-label={"Open " + project.title + " project details"}><ProjectArtwork kind={project.kind} /></Link>
            <div className="project-detail-copy">
              <span className="section-kicker">{project.id === "bee" ? "COMPLETED BUILD" : project.id === "drone" ? "CUSTOM ENQUIRY" : "PROJECT KIT"}</span>
              <h2><Link href={project.destination}>{project.title}</Link></h2>
              <p className="project-card-summary">{project.summary}</p>
              <p>{project.detail}</p>
            </div>
            <Link className="project-card-full-link" href={project.destination} aria-label={"View details, components and prices for " + project.title}>View project details and prices</Link>
          </article>
        ))}
      </div>
      <section className="bee-bom-section" aria-labelledby="bee-bom-title">
        <div className="bee-bom-heading">
          <span className="section-kicker">COMPLETED BUILD / BEE BIPED</span>
          <h2 id="bee-bom-title">What makes Bee work?</h2>
          <p>Bluetooth-controlled, six-servo walking robot with an LED-matrix face, distance sensing and a custom 3D-printed body. Parts below are matched to the current shop catalogue. <a className="underlined-link" href={projectTypes[0].external} target="_blank" rel="noreferrer">View source on GitHub ↗</a></p>
        </div>
        <div className="bee-build-gallery" aria-label="Bee Biped build photos">
          <figure><Image src="https://raw.githubusercontent.com/KaranJoyKundu/portfolio/main/public/images/bee/photo1.jpg" alt="Bee completed robot standing on a table beside detached 3D-printed parts" width={1200} height={900} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" /><figcaption>Completed working prototype</figcaption></figure>
          <figure><Image src="https://raw.githubusercontent.com/KaranJoyKundu/portfolio/main/public/images/bee/20260819_141629.jpg" alt="Bee internal torso wiring, Arduino Nano, servo connections and parallel battery pack" width={1200} height={900} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" /><figcaption>Internal electronics and wiring</figcaption></figure>
          <figure><Image src="https://raw.githubusercontent.com/KaranJoyKundu/portfolio/main/public/images/bee/20260819_142150.jpg" alt="Close-up of the robot's 3D-printed hat" width={1200} height={900} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" /><figcaption>Custom 3D-printed details</figcaption></figure>
        </div>
        <div className="bee-project-facts">
          <p><strong>Built for:</strong> a hands-on robotics demonstration at Khulna City College, delivered on 19 August 2026.</p>
          <p><strong>Core features:</strong> 30+ Bluetooth commands, six servo joints for walking and gestures, 8×8 LED-matrix expressions, and on-demand HC-SR04 distance readout.</p>
          <p><strong>Build:</strong> Arduino Nano, six SG90 servos, MAX7219 matrix, HC-05 Bluetooth, HC-SR04, two 1100 mAh cells in parallel, and customized 3D-printed PLA/PETG body.</p>
          <p><strong>Result:</strong> completed after around six weeks and 50+ hardware/software iterations; estimated typical runtime about six hours per charge.</p>
          <p><a className="underlined-link" href="https://karanjoykundu.github.io/portfolio/projects/bee-biped-robot" target="_blank" rel="noreferrer">Read the full Bee Biped case study ↗</a></p>
        </div>
        <div className="bee-bom-photo-strip" aria-label="Photos of the components used in Bee">
          {beeParts.map((part) => {
            const product = bySku.get(part.sku);
            return <article className="bee-bom-photo-card" key={part.sku}>
              <div className="bee-bom-photo">{part.sku === "P021" ? <ProductPhoto name={product?.name ?? part.name} sku={part.sku} category={product?.categorySlug} /> : <ProductPhoto name={product?.name ?? part.name} sku={part.sku} category={product?.categorySlug} />}</div>
              <h3>{part.name}</h3><p>{part.role}</p><span>× {part.quantity}</span>
            </article>;
          })}
        </div>
        <div className="bee-bom-details">
          <div className="bee-bom-table-wrap">
            <table className="bee-bom-table"><thead><tr><th>Component</th><th>Qty</th><th>Catalogue unit price</th><th>Subtotal</th></tr></thead><tbody>
              {beeParts.map((part) => {
                const product = bySku.get(part.sku);
                const unitPrice = product?.priceBdt ?? null;
                return <tr key={part.sku}><td>{part.name}</td><td>{part.quantity}</td><td>{unitPrice !== null ? formatPriceBdt(unitPrice) : "Not priced"}</td><td>{unitPrice !== null ? formatPriceBdt(unitPrice * part.quantity) : "—"}</td></tr>;
              })}
            </tbody></table>
          </div>
          <aside className="bee-bom-total"><span>Catalogue-value subtotal</span><strong>{formatPriceBdt(beeKnownSubtotal)}</strong><p>Current selling-price estimate for the priced components above, not the shop&apos;s purchase cost or a project quote.</p></aside>
        </div>
        <p className="bee-bom-note">Not included: the exact power-bank boost/charging module (not matched to a verified catalogue SKU), custom PLA/PETG printed parts, wiring, switches, connectors and assembly. Build photos and detailed project information are sourced from the Bee Biped case study on Karan&apos;s portfolio. Catalogue component photos and price estimates below are separate from the full project build cost.</p>
      </section>

      <section className="project-kit-area">
        <div className="section-heading"><div><span className="section-kicker">COMPLETE BUILD PACKAGES</span><h2>Pick a kit and add the whole package to your cart.</h2></div><Link href="/cart" className="underlined-link">Open cart →</Link></div>
        <p className="project-kit-disclaimer">Figures are the estimated costs stated in the supplied robot-kit list, not guaranteed final quotes. The BOM and catalogue codes are shown on each kit page; only exact catalogue matches are assigned P-codes. Kits are build-to-order and the shop confirms exact parts, availability and final amount before payment.</p>
        {kitGroups.map((group) => (
          <section className="project-kit-group" id={group.id + "-kits"} key={group.id}>
            <div><h3>{group.title}</h3><p>{group.intro}</p></div>
            <div className="project-kit-grid">
              {group.skus.map((sku) => {
                const product = bySku.get(sku);
                if (!product) return <article className="notice-panel" key={sku}><strong>{sku} is not loaded</strong><p>Refresh after the catalogue has updated.</p></article>;
                return (
                  <article className="project-kit-card" key={product.id}>
                    <div className="project-kit-card-top"><span>{product.sku}</span><span>BUILD TO ORDER</span></div>
                    <h4>{product.name}</h4>
                    <p>{product.summary}</p>
                    <strong className="project-kit-price">{formatPriceBdt(product.priceBdt)}</strong>
                    <Link className="underlined-link" href={"/products/" + product.slug}>View full parts list →</Link>
                    <ProductPurchaseControl productId={product.id} basePriceBdt={product.priceBdt} orderable={product.orderable === true} enquiryOnly={!checkout.checkoutEnabled} variants={[]} />
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </section>
      <section className="project-help-callout" id="project-help-callout">
        <div><span className="section-kicker">YOUR IDEA / YOUR DEADLINE</span><h2>Need a custom parts list or a little project guidance?</h2><p>Message me with what you are trying to build. I can help you choose components even if you are not ready to order.</p></div>
        <a className="button button-primary" href={business.contact.whatsappUrl + "?text=" + encodeURIComponent("Hello Karan, I am stuck on a project and need some help choosing components.")} target="_blank" rel="noreferrer">Ask for project help ↗</a>
      </section>
    </section>
  );
}
