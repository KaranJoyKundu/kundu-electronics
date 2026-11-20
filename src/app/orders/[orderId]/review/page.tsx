import type { Metadata } from "next";
import Link from "next/link";
import { OrderReviewClient } from "@/components/orders/order-review-client";

export const metadata: Metadata = { title: "Leave a review" };

export default async function OrderReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <section className="container simple-page order-review-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>Review</span></div>
      <span className="section-kicker">CUSTOMER FEEDBACK</span>
      <h1>Leave a review</h1>
      <OrderReviewClient orderId={orderId} />
    </section>
  );
}
