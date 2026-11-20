import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStorePrincipal } from "@/lib/supabase/authz";
import { signOutAdmin } from "./actions";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const principal = await getStorePrincipal();
  if (!principal) redirect("/admin/login");
  return <div className="admin-shell">
    <header className="admin-shell-header"><div className="container admin-shell-topbar">
      <Link href="/admin" className="admin-shell-brand">Kundu Electronics / Admin</Link>
      <span>{principal.email ?? "Signed-in staff"} · {principal.role}</span>
      <form action={signOutAdmin}><button type="submit" className="text-button">Sign out</button></form>
    </div><nav className="container admin-nav" aria-label="Administration">
      <Link href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/inventory">Inventory</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/reviews">Reviews</Link>
      {principal.role === "admin" ? <><Link href="/admin/payments">Payment verification</Link><Link href="/admin/settings">Settings</Link></> : null}
    </nav></header>
    <main className="container admin-shell-main">{children}</main>
  </div>;
}
