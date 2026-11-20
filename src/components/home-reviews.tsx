import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PublicReview = { id: string; reviewer_display_name: string | null; rating: number; review_text: string | null; created_at: string };
type PublicStats = { completedOrders: number; customers: number; verifiedReviews: number };

function nonNegativeCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function HomeReviews() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const [statsResult, reviewsResult] = await Promise.all([
    supabase.rpc("get_public_store_stats"),
    supabase.from("customer_reviews").select("id,reviewer_display_name,rating,review_text,created_at")
      .eq("status", "approved").order("created_at", { ascending: false }).limit(6),
  ]);
  const rawStats = statsResult.data as Record<string, unknown> | null;
  const stats: PublicStats | null = rawStats && !statsResult.error ? {
    completedOrders: nonNegativeCount(rawStats.completedOrders) ?? 0,
    customers: nonNegativeCount(rawStats.customers) ?? 0,
    verifiedReviews: nonNegativeCount(rawStats.verifiedReviews) ?? 0,
  } : null;
  const reviews = !reviewsResult.error ? (reviewsResult.data ?? []) as PublicReview[] : null;
  if (!stats && !reviews) return null;

  return <section className="container customer-reviews-section" id="customer-reviews">
    <div className="section-heading customer-reviews-heading">
      <div><span className="section-kicker">CUSTOMER FEEDBACK / REAL ORDERS</span><h2>Built trust, one order at a time.</h2><p>Feedback from customers with completed orders, published after moderation.</p></div>
      <Link href="/shop" className="underlined-link">Shop components ↗</Link>
    </div>
    {stats ? <div className="review-stat-grid">
      <article className="review-stat-card"><span>Completed orders</span><strong>{stats.completedOrders.toLocaleString("en-BD")}</strong></article>
      <article className="review-stat-card"><span>Customers</span><strong>{stats.customers.toLocaleString("en-BD")}</strong></article>
      <article className="review-stat-card"><span>Published reviews</span><strong>{stats.verifiedReviews.toLocaleString("en-BD")}</strong></article>
    </div> : null}
    {reviews?.length ? <div className="customer-review-grid">{reviews.map((review) => <article className="customer-review-card" key={review.id}>
      <div className="review-stars" aria-label={`Rating ${review.rating} out of 5`}>{ "★".repeat(review.rating) }{ "☆".repeat(5 - review.rating) }</div>
      {review.review_text ? <p className="customer-review-text">{review.review_text}</p> : <p className="customer-review-text review-empty-text">Customer left a star rating.</p>}
      <div className="customer-review-meta"><strong>{review.reviewer_display_name || "Verified customer"}</strong><span>{new Date(review.created_at).toLocaleDateString("en-BD", { month: "short", year: "numeric" })}</span></div>
      <span className="review-verified-label">Verified delivered order</span>
    </article>)}</div> : reviews ? <div className="notice-panel customer-reviews-empty"><strong>No published reviews yet</strong><p>Completed customer feedback will appear here after moderation.</p></div> : <p className="customer-reviews-unavailable">Customer reviews are temporarily unavailable.</p>}
    <div className="review-external-links"><Link href="/contact" className="underlined-link">Share feedback with the shop</Link><a href="https://www.facebook.com/KunduBrothersElectronics/" target="_blank" rel="noreferrer">Kundu Electronics on Facebook ↗</a></div>
  </section>;
}
