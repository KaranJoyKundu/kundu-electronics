import type { Metadata } from "next";
import { business } from "@/config/business";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="container simple-page">
      <span className="section-kicker">CONTACT</span>
      <h1>Get in touch</h1>
      <p className="simple-lead">Have a component question or need help with a project? Contact Kundu Electronics in Khulna.</p>
      <div className="support-cards">
        <a href={`tel:${business.contact.publicPhone}`}>
          <strong>Call / WhatsApp</strong>
          <span>{business.contact.publicPhoneDisplay}</span>
        </a>
        <a href={`mailto:${business.contact.publicEmail}`}>
          <strong>Email</strong>
          <span>{business.contact.publicEmail}</span>
        </a>
        <a href={business.contact.whatsappUrl} target="_blank" rel="noreferrer">
          <strong>WhatsApp</strong>
          <span>Message the shop</span>
        </a>
        <a href={business.contact.facebookUrl} target="_blank" rel="noreferrer">
          <strong>Facebook</strong>
          <span>Kundu Electronics</span>
        </a>
      </div>
      <div className="notice-panel">
        <strong>Business location</strong>
        <p>{business.contact.publicAddress}</p>
        <p>{business.consultationLabel}. Opening hours have not been confirmed, so please contact the shop before visiting.</p>
      </div>
    </section>
  );
}
