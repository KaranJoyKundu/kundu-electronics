import type { Metadata } from "next";
import Link from "next/link";
import { OrderConfirmationClient } from "@/components/orders/order-confirmation-client";
import { getPublicCheckoutConfig } from "@/data/storefront";

export const metadata: Metadata = { title: "Order status" };

type PageProps = {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ payment?: string | string[] }>;
};

export default async function OrderPage({ params, searchParams }: PageProps) {
  const [{ orderId }, checkout, query] = await Promise.all([
    params,
    getPublicCheckoutConfig(),
    searchParams ?? Promise.resolve({} as { payment?: string | string[] }),
  ]);
  const rawPaymentPreference = Array.isArray(query.payment) ? query.payment[0] : query.payment;
  const paymentPreference = rawPaymentPreference === "cash_on_delivery" || rawPaymentPreference === "online_payment"
    ? rawPaymentPreference
    : null;
  return (
    <section className="container simple-page order-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Order status</span></div>
      <span className="section-kicker">ORDER CONFIRMATION</span>
      <h1>Order status</h1>
      <OrderConfirmationClient orderId={orderId} checkout={checkout} paymentPreference={paymentPreference} />
    </section>
  );
}
