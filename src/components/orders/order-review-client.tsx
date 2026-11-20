"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { parseOrderSummary, type OrderSummary } from "@/lib/orders/order-summary";

type ReviewStatus = { eligible: boolean; alreadyReviewed: boolean; reviewStatus: "pending" | "approved" | "rejected" | null };
type State = "loading" | "ready" | "error";

const facebookReviewsUrl = "https://www.facebook.com/KunduBrothersElectronics/";

export function OrderReviewClient({ orderId }: { orderId: string }) {
  const [state, setState] = useState<State>("loading");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [rating, setRating] = useState(5);
  const [displayName, setDisplayName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`/api/orders/${orderId}`, { cache: "no-store" }).then(async (response) => {
        const payload: unknown = await response.json();
        const parsed = parseOrderSummary(payload);
        if (!response.ok || !parsed) throw new Error("order");
        return parsed;
      }),
      fetch(`/api/orders/${orderId}/review`, { cache: "no-store" }).then(async (response) => {
        const payload = await response.json() as ReviewStatus;
        if (!response.ok || typeof payload.eligible !== "boolean" || typeof payload.alreadyReviewed !== "boolean") throw new Error("review");
        return payload;
      }),
    ]).then(([loadedOrder, loadedReview]) => {
      if (!active) return;
      setOrder(loadedOrder);
      setReviewStatus(loadedReview);
      setState("ready");
    }).catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [orderId]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ rating, displayName: displayName.trim() || null, reviewText: reviewText.trim() || null }),
      });
      const result = await response.json() as { error?: string; submitted?: boolean };
      if (!response.ok) {
        setError(result.error ?? "Review submission failed. Please retry.");
        return;
      }
      setReviewStatus({ eligible: true, alreadyReviewed: true, reviewStatus: "pending" });
      setMessage("Thank you! Your review has been submitted and will appear on the website after moderation.");
      setReviewText("");
    } catch {
      setError("Network error. Please try submitting again.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <section className="order-state"><p>Loading review eligibility…</p></section>;
  if (state === "error" || !order || !reviewStatus) return <div className="notice-panel"><strong>Review page unavailable</strong><p>Open this page in the same browser you used to place the order, or contact the shop if you need help.</p></div>;

  if (!reviewStatus.eligible) return <div className="notice-panel"><strong>Reviews unlock after delivery</strong><p>This order can be reviewed once it is confirmed and marked delivered.</p><Link href={`/orders/${orderId}`} className="underlined-link">View order status</Link></div>;

  if (reviewStatus.alreadyReviewed && reviewStatus.reviewStatus !== "rejected") return (
    <div className="notice-panel"><strong>Thanks for your feedback</strong><p>{reviewStatus.reviewStatus === "approved" ? "Your review has been published." : "Your review is awaiting moderation before it appears publicly."}</p><div className="review-external-links"><Link href="/#customer-reviews" className="underlined-link">Read customer reviews</Link><a href={facebookReviewsUrl} target="_blank" rel="noreferrer">Facebook page ↗</a></div></div>
  );

  return (
    <div className="order-review-layout">
      <section className="order-summary-panel">
        <span className="section-kicker">VERIFIED ORDER</span>
        <h2>{order.orderNumber}</h2>
        <p>Delivered order from Kundu Electronics</p>
        {reviewStatus.reviewStatus === "rejected" ? <div className="notice-panel"><strong>Your earlier review wasn't approved</strong><p>You may edit and submit it again for moderation.</p></div> : null}
        <form className="checkout-form review-form" onSubmit={submitReview}>
          <fieldset className="review-rating-fieldset">
            <legend>Your rating</legend>
            <div className="review-rating-picker">
              {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} aria-label={`Rate ${star} out of 5`} aria-pressed={rating === star} className={rating >= star ? "review-star-selected" : "review-star"} onClick={() => setRating(star)}>★</button>)}
            </div>
            <p>{rating} out of 5 stars</p>
          </fieldset>
          <label>Display name (optional)<input value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} placeholder="How you'd like to appear publicly" /></label>
          <label>Your review (optional)<textarea rows={5} maxLength={1000} value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Tell others about your experience…" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-success" role="status">{message}</p> : null}
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit review"}</button>
          <p className="checkout-disclaimer">Reviews are moderated before publication. Your name is hidden publicly unless you choose a display name.</p>
        </form>
        <div className="review-external-links"><Link href="/#customer-reviews" className="underlined-link">Website reviews</Link><a href={facebookReviewsUrl} target="_blank" rel="noreferrer">Review us on Facebook ↗</a></div>
      </section>
    </div>
  );
}
