import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/admin-login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default function AdminLoginPage() {
  return (
    <section className="container simple-page admin-auth-page">
      <span className="section-kicker">STORE ADMINISTRATION</span>
      <h1>Admin sign in</h1>
      <p className="simple-lead">Access is limited to accounts provisioned by the store owner. Public registration is disabled.</p>
      <div className="notice-panel">
        <strong>Existing admin/staff account required</strong>
        <p>Enter the email address of an account already created and assigned a role in Supabase. This form cannot create an account or grant permissions.</p>
        <AdminLoginForm />
      </div>
      <p><Link href="/">Return to the storefront</Link></p>
    </section>
  );
}
