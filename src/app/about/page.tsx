import type { Metadata } from "next";
import { business } from "@/config/business";

export const metadata: Metadata = { title: "About Kundu Electronics" };

export default function AboutPage() {
  return (
    <section className="container simple-page">
      <span className="section-kicker">ABOUT THE SHOP</span>
      <h1>{business.name}</h1>
      <p className="simple-lead">{business.tagline}</p>
      <div className="notice-panel">
        <strong>Electronics components in Khulna</strong>
        <p>Kundu Electronics supports students, makers and electronics enthusiasts with components and practical project support.</p>
        <p>Based near KUET at {business.contact.publicAddress}. Consultation is free.</p>
        <p>For current product availability, contact the shop before making a visit. Product listings will only be published after their selling price and customer-facing details are reviewed.</p>
      </div>
    </section>
  );
}
