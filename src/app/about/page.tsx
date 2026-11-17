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
        <p>Kundu Electronics focuses on affordable electronics components and practical, student-focused solutions.</p>
        <p>Based near KUET at {business.contact.publicAddress}.</p>
        <p>Product information and stock can change. Contact the shop to confirm specifications and availability before visiting or purchasing.</p>
      </div>
    </section>
  );
}
