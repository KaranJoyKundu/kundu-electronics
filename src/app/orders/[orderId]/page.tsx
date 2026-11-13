import type { Metadata } from "next";
import Link from "next/link";
import { OrderConfirmationClient } from "@/components/orders/order-confirmation-client";
import { getPublicCheckoutConfig } from "@/data/storefront";

export const metadata: Metadata = { title: "Order status" };

type PageProps = { params: Promise<{ orderId: string }> };

export default async function OrderPage({ params }: PageProps) {
  const [{ orderId }, checkout] = await Promise.all([params, getPublicCheckoutConfig()]);
  return (
    <section className="container simple-page order-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Order status</span></div>
      <span className="section-kicker">ORDER CONFIRMATION</span>
      <h1>Order status</h1>
      <OrderConfirmationClient orderId={orderId} checkout={checkout} />
    </section>
  );
}
