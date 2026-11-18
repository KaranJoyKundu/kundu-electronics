import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectArtwork, type ProjectKind } from "@/components/project-artwork";
import { getStorefrontCatalogue } from "@/data/storefront";
import { formatPriceBdt } from "@/lib/format";
import { business } from "@/config/business";

type Project = {
  slug: string; kind: ProjectKind; title: string; kicker: string; summary: string;
  description: string[]; kits?: string[]; next?: string; source?: string;
};
const projects: Project[] = [
  { slug:"bee-biped",kind:"bee",title:"Bee Biped Robot",kicker:"COMPLETED BUILD",summary:"A Bluetooth-controlled, 3D-printed biped robot built around an Arduino Nano and six servo motors.",description:[
    "Bee combines six SG90 servo motors for walking and gestures with a MAX7219 8×8 LED matrix for facial expressions. An HC-05 Bluetooth module receives commands, while an HC-SR04 ultrasonic sensor provides on-demand distance readings.",
    "The documented build uses an Arduino Nano, two 1100 mAh cells in parallel, and a custom 3D-printed PLA/PETG body. The project documentation describes more than 30 Bluetooth commands and records the prototype's development and iteration history.",
    "The catalogue subtotal is an estimate for the listed, matched components only. Printed parts, wiring, connectors and unlisted power electronics are not included in that subtotal."
  ],source:"https://karanjoykundu.github.io/portfolio/projects/bee-biped-robot",next:"/projects#bee-bom-title"},
  { slug:"line-follower",kind:"lfr",title:"Line Following Robot",kicker:"THREE KIT TIERS",summary:"A small autonomous robot that follows a marked track using infrared line sensors and a motor-control system.",description:[
    "Choose the entry-level participation build, the competitive build with a more capable sensor array, or the encoder-based elite configuration. Each tier is a separate build-to-order package.",
    "The kit descriptions and component quantities are shown on their individual product pages. Exact parts, availability and final amount are confirmed by the shop before payment."
  ],kits:["LFR-T1","LFR-T2","LFR-T3"],next:"/projects#lfr-kits"},
  { slug:"soccer-bot",kind:"soccerbot",title:"Soccer Bot",kicker:"THREE KIT TIERS",summary:"A student robotics kit range for building a mobile robot designed for soccer-style competition.",description:[
    "The range includes the Budget Scrapper, Precision Striker and Optimized Juggernaut packages. These are three distinct kit options, not a claim that the pictured reference robot is one of the shop's own completed builds.",
    "Open each kit's product page to review its published package summary and price. The shop confirms exact components and availability before accepting an order."
  ],kits:["SB-T1","SB-T2","SB-T3"],next:"/projects#soccerbot-kits"},
  { slug:"rc-speed-battle",kind:"rc",title:"RC Speed Battle",kicker:"THREE KIT TIERS",summary:"A remote-control speed-car project with a matching controller package in each tier.",description:[
    "Choose between three package levels. Each listed price is for the robot and its matching remote-controller components as described in the supplied kit list.",
    "The linked product pages show the current package price and available description. Final component selection and availability are confirmed by the shop."
  ],kits:["RC-T1","RC-T2","RC-T3"],next:"/projects#rc-kits"},
  { slug:"drone",kind:"drone",title:"Drone Projects",kicker:"CUSTOM PROJECT ENQUIRY",summary:"Planning a drone build? Start with your intended use, flight requirements and budget.",description:[
    "Drone builds depend heavily on frame size, motors, ESCs, flight controller, battery and payload requirements. Kundu Electronics can help scope a parts list around the project brief.",
    "There is currently no verified standard drone kit BOM or fixed package price in the catalogue. Contact the shop for a custom discussion rather than relying on an assumed parts list."
  ]}
];
export async function generateStaticParams(){return projects.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const p=projects.find(x=>x.slug===slug);
 return p?{title:p.title,description:p.summary}:{title:"Project not found"};
}
export default async function ProjectDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const project=projects.find(p=>p.slug===slug); if(!project) notFound();
 const {products}=await getStorefrontCatalogue(250,1);
 const bySku=new Map(products.map(p=>[p.sku,p]));
 const kits=(project.kits??[]).map(sku=>bySku.get(sku)).filter((p):p is NonNullable<typeof p>=>Boolean(p));
 return <section className="container simple-page project-detail-page">
  <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/projects">Projects</Link><span>/</span><span>{project.title}</span></div>
  <header className="project-detail-header"><span className="section-kicker">{project.kicker}</span><h1>{project.title}</h1><p className="simple-lead">{project.summary}</p></header>
  <div className="project-detail-hero"><ProjectArtwork kind={project.kind}/><div className="project-detail-description">{project.description.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{project.source&&<p><a className="underlined-link" href={project.source} target="_blank" rel="noreferrer">Read the original Bee Biped case study ↗</a></p>}</div></div>
  {project.slug==="bee-biped"&&<section className="project-kit-area"><div className="section-heading"><div><span className="section-kicker">COMPONENTS & COST</span><h2>Build components and catalogue prices</h2><p>See the matched component list, quantities and current catalogue subtotal.</p></div></div><Link className="button button-primary" href="/projects#bee-bom-title">View Bee component breakdown and prices →</Link></section>}
  {project.kits&&<section className="project-kit-area"><div className="section-heading"><div><span className="section-kicker">AVAILABLE PACKAGES</span><h2>Choose your build tier</h2><p>Current catalogue prices; final parts and availability are confirmed by the shop.</p></div></div><div className="project-kit-grid">{project.kits.map(sku=>{const product=bySku.get(sku);return product?<article className="project-kit-card" key={sku}><div className="project-kit-card-top"><span>{sku}</span><span>BUILD TO ORDER</span></div><h3>{product.name}</h3><p>{product.summary}</p><strong className="project-kit-price">{formatPriceBdt(product.priceBdt)}</strong><Link className="underlined-link" href={"/products/"+product.slug}>Full parts list & product details →</Link></article>:<article className="notice-panel" key={sku}><strong>{sku}</strong><p>Package is not currently available in the published catalogue.</p></article>})}</div></section>}
  {project.slug==="drone"&&<section className="project-help-callout"><div><span className="section-kicker">CUSTOM BUILD</span><h2>Tell us what you want to fly.</h2><p>Share your intended use, target flight time, payload and budget so the parts can be scoped correctly.</p></div><a className="button button-primary" href={business.contact.whatsappUrl+"?text="+encodeURIComponent("Hello Kundu Electronics, I would like help planning a drone project.")} target="_blank" rel="noreferrer">Discuss a drone build ↗</a></section>}
  <div className="project-detail-footer"><Link className="underlined-link" href="/projects">← All projects</Link>{project.next&&<Link className="underlined-link" href={project.next}>See project kit section →</Link>}</div>
 </section>;
}
