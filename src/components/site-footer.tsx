import Link from "next/link";
import { business } from "@/config/business";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Link href="/" className="footer-brand">KUNDU<span> ELECTRONICS</span></Link>
          <p>Electronics components for learning, experimenting and building.</p>
          <span className="footer-location">{business.locationLabel}</span>
        </div>
        <div className="footer-links-column"><h2>Explore</h2><Link href="/shop">Shop all</Link><Link href="/cart">Shopping cart</Link><Link href="/about">About us</Link></div>
        <div className="footer-links-column"><h2>Help</h2><Link href="/support">Support</Link><Link href="/contact">Contact</Link><Link href="/shipping-returns">Shipping & returns</Link></div>
        <div className="footer-contact-column"><h2>Get in touch</h2><p>Public contact details will appear here once confirmed by the business.</p></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Kundu Electronics</span><span>Prices, availability and policies will be published from verified business data.</span></div>
    </footer>
  );
}
