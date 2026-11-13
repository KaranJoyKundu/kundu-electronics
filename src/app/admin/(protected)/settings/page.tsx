import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStorePrincipal } from "@/lib/supabase/authz";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { setCheckoutEnabled, updateDeliveryZone, updatePaymentSettings } from "../actions";

export const metadata: Metadata = { title: "Store settings · Admin" };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, principal, supabase] = await Promise.all([searchParams, getStorePrincipal(), createServerSupabaseClient()]);
  if (!principal) redirect("/admin/login");
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  if (!supabase) return <section className="simple-page"><h1>Store settings</h1><p>Connect Supabase to configure the store.</p></section>;
  const [settingsResult, methodsResult, zonesResult] = await Promise.all([
    supabase.from("store_settings").select("checkout_enabled,reservation_ttl_minutes").eq("singleton", true).maybeSingle(),
    supabase.from("payment_method_settings").select("method,is_enabled,receiving_number,customer_instructions,updated_at").order("method"),
    supabase.from("delivery_zones").select("id,code,name,coverage_description,delivery_charge_bdt,is_enabled").order("name"),
  ]);
  if (settingsResult.error || methodsResult.error || zonesResult.error) return <section className="simple-page"><h1>Store settings</h1><p>Settings tables are unavailable. Apply the migration and check administrator access.</p></section>;
  const methods = methodsResult.data ?? [];
  const zones = zonesResult.data ?? [];
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">OWNER CONFIGURATION</span><h1>Store settings</h1><p>Checkout remains disabled until payment instructions and at least one charged delivery zone are configured and approved.</p></div></div>
    {result ? <p role="status" className={result === "saved" ? "admin-result-success" : "admin-result-error"}>{result === "saved" ? "Settings saved." : result === "checkout-prerequisites" ? "Enable at least one configured manual payment method and one enabled delivery zone with a known charge first." : "Settings could not be saved. Check values and permissions."}</p> : null}
    <article className="admin-editor"><h2>Checkout switch</h2><p>Do not enable until receiving numbers, owner-approved instructions and delivery charges have been entered.</p>
      <form action={setCheckoutEnabled} className="admin-inline-form"><label className="admin-check"><input name="enabled" type="checkbox" defaultChecked={settingsResult.data?.checkout_enabled ?? false} /> Enable customer checkout</label><button className="button button-small" type="submit">Save checkout setting</button></form>
      <p className="admin-footnote">Reservation expiry is currently unset. Orders will not lose reserved stock on an arbitrary timer.</p>
    </article>
    <h2>Manual payment methods</h2>
    <div className="admin-settings-grid">{methods.map((method) => <article className="admin-editor" key={method.method}><h3>{method.method.toUpperCase()}</h3><form action={updatePaymentSettings} className="admin-form-grid">
      <input type="hidden" name="method" value={method.method} />
      <label>Receiving number<input name="receivingNumber" defaultValue={method.receiving_number ?? ""} maxLength={32} placeholder="Owner-configured number" /></label>
      <label>Customer instructions<textarea name="instructions" defaultValue={method.customer_instructions ?? ""} rows={3} maxLength={500} placeholder="Exact owner-approved Send Money instructions" /></label>
      <label className="admin-check"><input name="enabled" type="checkbox" defaultChecked={method.is_enabled} /> Enable this payment method</label>
      <button className="button button-small" type="submit">Save {method.method}</button>
    </form></article>)}</div>
    <h2>Delivery zones</h2>
    <p>Only enable a zone after its exact service area and delivery charge have been approved.</p>
    <details className="admin-editor"><summary>Add delivery zone</summary><form action={updateDeliveryZone} className="admin-form-grid">
      <label>Code<input name="code" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="khulna-city" /></label>
      <label>Name<input name="name" required maxLength={120} /></label>
      <label>Delivery charge (BDT)<input name="chargeBdt" type="number" min="0" max="1000000" step="1" /></label>
      <label>Coverage description<input name="coverage" maxLength={500} /></label>
      <label className="admin-check"><input name="enabled" type="checkbox" /> Enable this zone</label>
      <button className="button button-small" type="submit">Create zone</button>
    </form></details>
    {zones.map((zone) => <article className="admin-editor" key={zone.id}><form action={updateDeliveryZone} className="admin-form-grid">
      <input type="hidden" name="id" value={zone.id} />
      <label>Code<input name="code" defaultValue={zone.code} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
      <label>Name<input name="name" defaultValue={zone.name} required maxLength={120} /></label>
      <label>Charge (BDT)<input name="chargeBdt" type="number" min="0" max="1000000" step="1" defaultValue={zone.delivery_charge_bdt ?? ""} /></label>
      <label>Coverage<input name="coverage" defaultValue={zone.coverage_description ?? ""} maxLength={500} /></label>
      <label className="admin-check"><input name="enabled" type="checkbox" defaultChecked={zone.is_enabled} /> Enabled</label>
      <button className="button button-small" type="submit">Save zone</button>
    </form></article>)}
  </section>;
}
