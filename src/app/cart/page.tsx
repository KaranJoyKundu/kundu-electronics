import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Shopping cart" };

export default function CartPage() {
  return <section className="container simple-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Cart</span></div><span className="section-kicker">YOUR ORDER</span><h1>Shopping cart</h1><div className="empty-cart"><span className="empty-cart-mark">＋</span><h2>Your cart is empty.</h2><p>Once verified products are added to the catalogue, you can add them here and review your order.</p><Link href="/shop" className="button button-primary">Continue shopping</Link></div></section>;
}
