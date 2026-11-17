import Link from "next/link";
import { business } from "@/config/business";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Link href="/" className="footer-brand">KUNDU<span> ELECTRONICS</span></Link>
          <p>{business.tagline}</p>
          <span className="footer-location">{business.locationLabel}</span>
        </div>
        <div className="footer-links-column"><h2>Explore</h2><Link href="/shop">Shop all</Link><Link href="/cart">Shopping cart</Link><Link href="/about">About us</Link></div>
        <div className="footer-links-column"><h2>Help</h2><Link href="/support">Support</Link><Link href="/contact">Contact</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/image-credits">Image credits</Link></div>
        <div className="footer-contact-column"><h2>Get in touch</h2><a href={`tel:${business.contact.publicPhone}`}>{business.contact.publicPhoneDisplay}</a><a href={`mailto:${business.contact.publicEmail}`}>{business.contact.publicEmail}</a><a href={business.contact.facebookUrl} target="_blank" rel="noreferrer">Facebook</a><p>{business.contact.publicAddress}</p></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Kundu Electronics</span><span>Prices, availability and policies are published only from verified business data.</span></div>
    </footer>
  );
}
