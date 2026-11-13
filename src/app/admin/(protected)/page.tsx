import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStorePrincipal } from "@/lib/supabase/authz";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const [supabase, principal] = await Promise.all([
    createServerSupabaseClient(),
    getStorePrincipal(),
  ]);

  if (!supabase || !principal) {
    return <section className="simple-page"><h1>Database not configured</h1><p>Connect Supabase and apply the reviewed migrations to enable store administration.</p></section>;
  }

  const [productsResult, ordersResult, pendingPaymentsResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    principal.role === "admin"
      ? supabase.from("payment_submissions").select("id", { count: "exact", head: true }).eq("status", "pending_verification")
      : Promise.resolve({ count: null, error: null }),
  ]);

  const tableError = productsResult.error ?? ordersResult.error ?? pendingPaymentsResult.error;
  if (tableError) {
    return (
      <section className="simple-page">
        <span className="section-kicker">ADMIN DASHBOARD</span>
        <h1>Store data is not ready</h1>
        <p>Apply the reviewed Supabase migrations and verify the admin role before using the dashboard. No synthetic dashboard metrics are shown.</p>
      </section>
    );
  }

  return (
    <section className="simple-page">
      <span className="section-kicker">ADMIN DASHBOARD</span>
      <h1>Store overview</h1>
      <p className="simple-lead">Live counts from the connected database. This dashboard does not create sample orders or sales.</p>
      <div className="support-cards admin-metrics">
        <article><strong>Products</strong><span>{productsResult.count ?? 0}</span></article>
        <article><strong>Orders</strong><span>{ordersResult.count ?? 0}</span></article>
        {principal.role === "admin" ? <article><strong>Payments awaiting review</strong><span>{pendingPaymentsResult.count ?? 0}</span></article> : null}
      </div>
      <div className="notice-panel"><strong>Store operations</strong><p>Use Products and Categories to manage the catalogue, Images to manage private product assets, Inventory for audited stock adjustments, Orders for fulfilment, and Payment verification for owner-only review.</p></div>
    </section>
  );
}
