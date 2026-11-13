import type { Metadata } from "next";
import Link from "next/link";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { getPublicCheckoutConfig } from "@/data/storefront";

export const metadata: Metadata = { title: "Shopping cart" };

export default async function CartPage() {
  const checkout = await getPublicCheckoutConfig();
  return (
    <section className="container simple-page cart-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Cart</span></div>
      <span className="section-kicker">YOUR ORDER</span>
      <h1>Shopping cart</h1>
      <CartPageClient checkout={checkout} />
    </section>
  );
}
