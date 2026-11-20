import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { moderateCustomerReview } from "../actions";

export const metadata: Metadata = { title: "Reviews · Admin" };

type ReviewRow = {
  id: string;
  order_id: string;
  reviewer_display_name: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
};

type OrderRow = { id: string; order_number: string; customer_name: string };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, supabase] = await Promise.all([searchParams, createServerSupabaseClient()]);
  if (!supabase) return <section className="simple-page"><h1>Reviews</h1><p>Connect Supabase to moderate reviews.</p></section>;

  const { data, error } = await supabase.from("customer_reviews")
    .select("id,order_id,reviewer_display_name,rating,review_text,created_at")
    .eq("status", "pending").order("created_at", { ascending: false }).limit(100);
  if (error) return <section className="simple-page"><h1>Reviews</h1><p>Review queue is unavailable.</p></section>;

  const reviews = (data ?? []) as ReviewRow[];
  const orderIds = reviews.map((review) => review.order_id);
  let orderRows: OrderRow[] = [];
  if (orderIds.length) {
    const ordersResult = await supabase.from("orders").select("id,order_number,customer_name").in("id", orderIds);
    if (ordersResult.error) return <section className="simple-page"><h1>Reviews</h1><p>Review order details are unavailable.</p></section>;
    orderRows = (ordersResult.data ?? []) as OrderRow[];
  }
  const orderMap = new Map(orderRows.map((order) => [order.id, order]));

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">CUSTOMER FEEDBACK</span><h1>Reviews</h1><p>Only reviews from delivered orders enter this queue. Approved reviews appear publicly.</p></div></div>
    {result ? <p className={result === "saved" ? "admin-result-success" : "admin-result-error"} role="status">{result === "saved" ? "Review moderation saved." : "Review moderation failed. Refresh and try again."}</p> : null}
    {reviews.length === 0 ? <div className="notice-panel"><strong>Queue is empty</strong><p>There are no reviews waiting for moderation.</p></div> : reviews.map((review) => {
      const order = orderMap.get(review.order_id);
      return <article className="admin-order-card admin-review-card" key={review.id}>
        <header><div><strong>{order?.order_number ?? "Order record"}</strong><span>{new Date(review.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}</span></div><strong aria-label={`Rating: ${review.rating} out of 5`} className="review-stars">{ "★".repeat(review.rating) }{ "☆".repeat(5 - review.rating) }</strong></header>
        <div className="admin-order-customer"><strong>{review.reviewer_display_name || "Verified customer"}</strong>{order?.customer_name ? <span>Order placed by {order.customer_name}</span> : null}</div>
        {review.review_text ? <p className="admin-review-text">{review.review_text}</p> : <p className="admin-review-text review-empty-text">Star rating only — no written comment.</p>}
        <div className="admin-order-actions">
          <form action={moderateCustomerReview} className="admin-inline-form"><input type="hidden" name="reviewId" value={review.id} /><button className="button button-small" type="submit" name="status" value="approved">Approve & publish</button><button className="button button-small button-secondary" type="submit" name="status" value="rejected">Reject</button></form>
        </div>
      </article>;
    })}
  </section>;
}
