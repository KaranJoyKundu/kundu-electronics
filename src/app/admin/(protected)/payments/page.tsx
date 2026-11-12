import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStorePrincipal } from "@/lib/supabase/authz";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyPayment } from "../actions";
import { formatPriceBdt } from "@/lib/format";

export const metadata: Metadata = { title: "Payment verification · Admin" };

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, principal, supabase] = await Promise.all([searchParams, getStorePrincipal(), createServerSupabaseClient()]);
  if (!principal) redirect("/admin/login");
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  if (!supabase) return <section className="simple-page"><h1>Payment verification</h1><p>Connect Supabase to view payment submissions.</p></section>;
  const { data, error } = await supabase.from("payment_submissions")
    .select("id,order_id,method,sender_phone,transaction_reference,amount_bdt,status,rejection_reason,submitted_at,verified_at")
    .order("submitted_at", { ascending: false }).limit(100);
  if (error) return <section className="simple-page"><h1>Payment verification</h1><p>Payment records are unavailable. Confirm admin role and database migration.</p></section>;
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">ADMIN ONLY</span><h1>Payment verification</h1><p>A transaction reference is a claim, not proof. Verify against the receiving account before approving.</p></div></div>
    {result ? <p className={result === "saved" ? "admin-result-success" : "admin-result-error"} role="status">{result === "saved" ? "Payment decision recorded in the audit history." : "The payment decision failed. Only pending submissions can be reviewed."}</p> : null}
    {(data ?? []).filter((payment) => payment.status === "pending_verification").length === 0 ? <div className="notice-panel"><strong>No payments awaiting verification</strong><p>Pending customer submissions appear here. No fake payment activity is shown.</p></div> : null}
    {(data ?? []).filter((payment) => payment.status === "pending_verification").map((payment) => <article className="admin-payment-card" key={payment.id}>
      <div className="admin-payment-heading"><div><strong>{payment.method.toUpperCase()}</strong><small>{new Date(payment.submitted_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}</small></div><strong>{formatPriceBdt(Number(payment.amount_bdt))}</strong></div>
      <dl><div><dt>Order ID</dt><dd><code>{payment.order_id}</code></dd></div><div><dt>Sender</dt><dd>{payment.sender_phone}</dd></div><div><dt>Transaction reference</dt><dd><code>{payment.transaction_reference}</code></dd></div></dl>
      <form action={verifyPayment} className="admin-inline-form"><input type="hidden" name="submissionId" value={payment.id} /><label>Note<input name="note" maxLength={500} placeholder="Internal verification note" /></label><button name="result" value="verified" type="submit" className="button button-small">Verify payment</button></form>
      <form action={verifyPayment} className="admin-inline-form"><input type="hidden" name="submissionId" value={payment.id} /><input type="hidden" name="result" value="rejected" /><label>Rejection reason (required)<input name="rejectionReason" required minLength={3} maxLength={500} /></label><button type="submit" className="button button-small button-secondary">Reject submission</button></form>
    </article>)}
    <details className="admin-history"><summary>Previous submissions ({(data ?? []).length})</summary><ul>{(data ?? []).filter((payment) => payment.status !== "pending_verification").map((payment) => <li key={payment.id}>{payment.method.toUpperCase()} · {payment.status.replaceAll("_", " ")} · {formatPriceBdt(Number(payment.amount_bdt))} · Order {payment.order_id}</li>)}</ul></details>
  </section>;
}
