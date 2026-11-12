import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProduct, updateProduct } from "../actions";

export const metadata: Metadata = { title: "Products · Admin" };
const statuses = ["draft", "review", "published", "archived"];
const availability = ["unknown", "in_stock", "low_stock", "out_of_stock", "availability_on_request", "backorder", "discontinued", "build_to_order"];

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, supabase] = await Promise.all([searchParams, createServerSupabaseClient()]);
  if (!supabase) return <section className="simple-page"><h1>Products</h1><p>Connect Supabase to manage catalogue records.</p></section>;
  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("id,sku,slug,name,brand,short_description,description,price_bdt,category_id,status,public_availability,orderable").order("updated_at", { ascending: false }),
    supabase.from("categories").select("id,name,slug,status").order("sort_order").order("name"),
  ]);
  if (productsResult.error || categoriesResult.error) return <section className="simple-page"><h1>Products</h1><p>Catalogue tables are unavailable. Apply the reviewed migration and verify staff permissions.</p></section>;
  const products = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const statusMessage: Record<string, string> = {
    saved: "Changes saved.", invalid: "Some fields are missing or invalid.",
    "needs-review": "A product needs a category and confirmed selling price before publication.",
    "save-failed": "The database rejected the change. Check the fields and permissions.",
  };
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">CATALOGUE</span><h1>Products</h1><p>Only owner-approved, complete products should be published.</p></div><Link href="/admin/categories">Manage categories →</Link></div>
    {result ? <p role="status" className={result === "saved" ? "admin-result-success" : "admin-result-error"}>{statusMessage[result] ?? "The action could not be completed."}</p> : null}
    <details className="admin-editor" open={products.length === 0}><summary>Add product</summary><form action={createProduct} className="admin-form-grid">
      <label>Product name<input name="name" required maxLength={180} /></label>
      <label>URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="arduino-nano" /></label>
      <label>SKU (optional)<input name="sku" maxLength={100} /></label>
      <label>Category<select name="categoryId" defaultValue=""><option value="">No category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.status})</option>)}</select></label>
      <label>Brand<input name="brand" maxLength={120} /></label>
      <label>Selling price (BDT)<input name="priceBdt" type="number" min="1" max="1000000000" step="1" placeholder="Leave blank if unconfirmed" /></label>
      <label>Short description<input name="shortDescription" maxLength={300} /></label>
      <label>Status<select name="status" defaultValue="draft">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Availability<select name="availability" defaultValue="unknown">{availability.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
      <label className="admin-full-field">Description<textarea name="description" rows={3} maxLength={5000} /></label>
      <label className="admin-check"><input name="orderable" type="checkbox" /> Allow ordering after availability is confirmed</label>
      <div className="admin-full-field"><button className="button button-primary" type="submit">Save product</button></div>
    </form></details>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Availability</th><th>Status</th><th>Edit</th></tr></thead><tbody>
      {products.length === 0 ? <tr><td colSpan={5}>No products yet. Import candidates remain unpublished until reviewed.</td></tr> : products.map((product) => <tr key={product.id}>
        <td><strong>{product.name}</strong><small>{product.sku || product.slug}</small></td>
        <td>{product.price_bdt === null ? "Pending" : `৳${Number(product.price_bdt).toLocaleString("en-BD")}`}</td>
        <td>{product.public_availability.replaceAll("_", " ")}</td><td>{product.status}</td>
        <td><Link href={`/admin/products/${product.id}/images`}>Images</Link> · <Link href={`/admin/products/${product.id}/variants`}>Options</Link> · <details><summary>Edit</summary><form action={updateProduct} className="admin-inline-form">
          <input type="hidden" name="id" value={product.id} />
          <label>Name<input name="name" defaultValue={product.name} required maxLength={180} /></label>
          <label>Slug<input name="slug" defaultValue={product.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
          <label>SKU<input name="sku" defaultValue={product.sku ?? ""} maxLength={100} /></label>
          <label>Category<select name="categoryId" defaultValue={product.category_id ?? ""}><option value="">No category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.status})</option>)}</select></label>
          <label>Brand<input name="brand" defaultValue={product.brand ?? ""} maxLength={120} /></label>
          <label>Selling price (BDT)<input name="priceBdt" type="number" min="1" max="1000000000" step="1" defaultValue={product.price_bdt ?? ""} /></label>
          <label>Short description<input name="shortDescription" defaultValue={product.short_description ?? ""} maxLength={300} /></label>
          <label>Status<select name="status" defaultValue={product.status}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Availability<select name="availability" defaultValue={product.public_availability}>{availability.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label>Description<textarea name="description" defaultValue={product.description ?? ""} rows={3} maxLength={5000} /></label>
          <label className="admin-check"><input name="orderable" type="checkbox" defaultChecked={product.orderable} /> Orderable</label>
          <button className="button button-small" type="submit">Save changes</button>
        </form></details></td>
      </tr>)}
    </tbody></table></div>
  </section>;
}
