import type { Metadata } from "next";
import Link from "next/link";
import { ProjectArtwork, type ProjectKind } from "@/components/project-artwork";
import { ProductPurchaseControl } from "@/components/cart/product-purchase-control";
import { getPublicCheckoutConfig, getStorefrontCatalogue } from "@/data/storefront";
import { formatPriceBdt } from "@/lib/format";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "Projects & robot kits",
  description: "Explore Kundu Electronics robot builds and complete line follower, soccer bot and RC speed battle kits.",
};

const projectTypes: Array<{ id: string; kind: ProjectKind; title: string; summary: string; detail: string; external?: string }> = [
  { id: "bee", kind: "bee", title: "Bee Biped Robot", summary: "A working Bluetooth-controlled biped robot with a 3D-printed body.", detail: "Built around an Arduino Nano, six SG90 servos, an HC-05 Bluetooth module, an HC-SR04 ultrasonic sensor and a MAX7219 8×8 LED-matrix face. The prototype was developed as a hands-on learning demonstration.", external: "https://github.com/KaranJoyKundu/bee-biped-robot" },
  { id: "lfr", kind: "lfr", title: "Line Following Robot", summary: "Three complete kit tiers for an autonomous line-following build.", detail: "Choose an entry, competitive or elite configuration. Each package includes the components and quantities listed in the supplied kit specification." },
  { id: "soccerbot", kind: "soccerbot", title: "Soccer Bot", summary: "A three-tier kit range for a student soccer robot.", detail: "Start with the Budget Scrapper, move up to the Precision Striker, or choose the Optimized Juggernaut." },
  { id: "rc", kind: "rc", title: "RC Speed Battle", summary: "Robot and remote-controller components packaged together.", detail: "Each tier includes the bot and matching remote components, based on the supplied RC Speed Battle parts list." },
  { id: "drone", kind: "drone", title: "Drone Projects", summary: "A custom project enquiry—not a pre-priced kit.", detail: "Tell me your intended build, requirements and budget. There is no published drone BOM or package price yet, so I can help scope the parts before quoting." },
];

const kitGroups = [
  { id: "lfr", title: "Line Following Robot kits", intro: "Choose the build level that fits your experience and competition goals.", skus: ["LFR-T1","LFR-T2","LFR-T3"] },
  { id: "soccerbot", title: "Soccer Bot kits", intro: "Three complete packages, from a budget build to a higher-power configuration.", skus: ["SB-T1","SB-T2","SB-T3"] },
  { id: "rc", title: "RC Speed Battle kits", intro: "Each price includes the robot and its matching controller components.", skus: ["RC-T1","RC-T2","RC-T3"] },
];

export default async function ProjectsPage() {
  const [catalogue, checkout] = await Promise.all([getStorefrontCatalogue(250, 1), getPublicCheckoutConfig()]);
  const bySku = new Map(catalogue.products.map((product) => [product.sku, product]));

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
            <ProjectArtwork kind={project.kind} />
            <div className="project-detail-copy">
              <span className="section-kicker">{project.id === "bee" ? "COMPLETED BUILD" : project.id === "drone" ? "CUSTOM ENQUIRY" : "PROJECT KIT"}</span>
              <h2>{project.title}</h2>
              <p className="project-card-summary">{project.summary}</p>
              <p>{project.detail}</p>
              {project.external ? <a className="underlined-link" href={project.external} target="_blank" rel="noreferrer">View source project on GitHub ↗</a> : null}
              {project.id === "drone" ? <a className="button button-outline" href={business.contact.whatsappUrl + "?text=" + encodeURIComponent("Hello Kundu Electronics, I would like to discuss a drone project. Can you help me plan the parts and cost?")} target="_blank" rel="noreferrer">Discuss a drone build ↗</a> : null}
            </div>
          </article>
        ))}
      </div>
      <section className="project-kit-area">
        <div className="section-heading"><div><span className="section-kicker">COMPLETE BUILD PACKAGES</span><h2>Pick a kit and add the whole package to your cart.</h2></div><Link href="/cart" className="underlined-link">Open cart →</Link></div>
        <p className="project-kit-disclaimer">Package totals are from the supplied robot kit price list. The BOM and catalogue codes are shown on each kit page; only exact catalogue matches are assigned P-codes. Kits are build-to-order and stock is confirmed after an order request is received.</p>
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
      <section className="project-help-callout">
        <div><span className="section-kicker">YOUR IDEA / YOUR DEADLINE</span><h2>Need a custom parts list or a little project guidance?</h2><p>Message me with what you are trying to build. I can help you choose components even if you are not ready to order.</p></div>
        <a className="button button-primary" href={business.contact.whatsappUrl + "?text=" + encodeURIComponent("Hello Karan, I am stuck on a project and need some help choosing components.")} target="_blank" rel="noreferrer">Ask for project help ↗</a>
      </section>
    </section>
  );
}
