import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <section className="container simple-page">
      <span className="section-kicker">WE ARE HERE TO HELP</span>
      <h1>Support</h1>
      <p className="simple-lead">Need help choosing a component or understanding a project requirement? Get in touch with the shop.</p>
      <div className="support-cards">
        <Link href="/contact"><strong>Contact the shop</strong><span>{business.contact.publicPhoneDisplay} · {business.contact.publicEmail}</span></Link>
        <Link href="/shipping-returns"><strong>Shipping & returns</strong><span>Read the currently available policy information. →</span></Link>
      </div>
      <div className="notice-panel">
        <strong>{business.consultationLabel}</strong>
        <p>Opening hours, delivery charges, delivery areas, warranty and return terms have not yet been configured. Contact the shop to confirm current arrangements before ordering or visiting.</p>
      </div>
    </section>
  );
}
