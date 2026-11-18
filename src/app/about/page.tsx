import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "About the Founder",
  description: "Meet Karan Joy Kundu and learn why he started Kundu Electronics for KUET students.",
};

export default function AboutPage() {
  return (
    <section className="container simple-page founder-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>About the Founder</span></div>
      <div className="founder-hero">
        <div className="founder-logo-wrap"><Image src="/brand/kundu-brothers-logo.png" alt="Kundu Brothers business logo" width={200} height={200} priority /></div>
        <div>
          <span className="section-kicker">THE PERSON BEHIND THE PARTS</span>
          <h1>Hi, I&apos;m <em>Karan Joy Kundu.</em></h1>
          <p className="simple-lead">ECE &apos;24 · Khulna University of Engineering & Technology</p>
          <p>I started Kundu Electronics because I ran into the same problem that many KUET students face: finding the right electronics components when a lab, experiment or project needs them.</p>
        </div>
      </div>
      <div className="founder-story-grid">
        <article className="founder-story-main">
          <span className="section-kicker">WHY I STARTED</span>
          <h2>A small missing component shouldn&apos;t stop a whole project.</h2>
          <p>When I first came to KUET, I did what every ECE student does when the labs started: I went looking for logic gate ICs, sensors, small modules and the basic components we need for lab work and hobby projects.</p>
          <p>Surprisingly, finding those parts around campus was difficult. Sometimes the only options were to travel all the way to Dhaka or order online and wait several days. A tiny missing component could delay an entire lab or project.</p>
          <p>After facing that more than once, I thought: <strong>if many of us are running into the same problem, why not solve it locally?</strong> That is how I started a small electronics supply initiative inside KUET.</p>
        </article>
        <aside className="founder-promise">
          <span className="section-kicker">THE IDEA</span>
          <h2>Make common parts easier to get.</h2>
          <p>Keep useful components close to campus, reduce waiting and shipping hassle, and make project work a little less stressful.</p>
          <span className="founder-promise-mark">01 / KUET</span>
        </aside>
      </div>
      <section className="founder-content-section">
        <span className="section-kicker">WHAT YOU CAN FIND</span>
        <h2>Useful components for learning and building.</h2>
        <div className="founder-offer-grid">
          <article><span>01</span><h3>Lab essentials</h3><p>Logic gate ICs, common electronic components and the small parts needed for practical lab work.</p></article>
          <article><span>02</span><h3>Microcontrollers & robotics</h3><p>Arduino and microcontroller parts, sensors, modules, connectors and small tools.</p></article>
          <article><span>03</span><h3>Special requests</h3><p>When a part is not on the shelf, I can try to arrange it through an importer who brings components from China.</p></article>
        </div>
      </section>
      <section className="founder-content-section founder-support-section">
        <span className="section-kicker">MORE THAN A COMPONENT SHOP</span>
        <h2>Need help choosing parts or finishing a circuit?</h2>
        <p>I try to keep prices student-friendly, often below large online-store prices such as RoboticsBD, while keeping a small margin so the service can continue. I also care about parts being good enough for real projects, not low-grade components that fail halfway through an experiment.</p>
        <p>You can message me even if you are not buying anything. As an ECE student, I am happy to share what I know, help you choose components, discuss a circuit, or suggest what to add or avoid. And when someone has a temporary money issue but urgently needs a part for a lab or project, I will try to work something out with them.</p>
        <p><strong>Customer service comes first.</strong> I believe a good experience and honest help speak louder than an advertisement.</p>
        <div className="founder-cta-row">
          <Link className="button button-primary" href="/contact">Contact Kundu Electronics</Link>
          <a className="button button-outline" href={business.contact.whatsappUrl + "?text=" + encodeURIComponent("Hello Karan, I need help with an electronics project.")} target="_blank" rel="noreferrer">Message me on WhatsApp ↗</a>
        </div>
      </section>
    </section>
  );
}
