import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProductVariant, updateProductVariant } from "../../../actions";

export const metadata: Metadata = { title: "Product options · Admin" };
type Props = { params: Promise<{ productId: string }>; searchParams: Promise<{ result?: string }> };
const optionTemplate = `{\n  \"voltage\": \"6V\",\n  \"speed\": \"300 RPM\"\n}`;

export default async function ProductVariantsPage({ params, searchParams }: Props) {
  const [{ productId }, { result }, supabase] = await Promise.all([params, searchParams, createServerSupabaseClient()]);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)) notFound();
  if (!supabase) return <section className="simple-page"><h1>Product options</h1><p>Connect Supabase to manage product options.</p></section>;
  const [{ data: product, error: productError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from("products").select("id,name,slug,price_bdt,status").eq("id", productId).maybeSingle(),
    supabase.from("product_variants").select("id,sku,name,option_values,price_override_bdt,is_active,sort_order").eq("product_id", productId).order("sort_order").order("name"),
  ]);
  if (productError || !product) notFound();
  if (variantsError) return <section className="simple-page"><h1>Product options</h1><p>Options could not be loaded. Check staff access and database migration status.</p></section>;
  const messages: Record<string, string> = { "variant-saved": "Product option saved.", "variant-invalid": "Check the option name, price and JSON values.", "variant-failed": "The option could not be saved. Check SKU uniqueness and field constraints." };
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">PRODUCT OPTIONS</span><h1>{product.name}</h1><p>Options share this product’s inventory quantity. Each option may override the public selling price.</p></div><Link href="/admin/products">← Products</Link></div>
    {result ? <p role="status" className={result === "variant-saved" ? "admin-result-success" : "admin-result-error"}>{messages[result] ?? "Action completed."}</p> : null}
    <div className="admin-result-note"><strong>Base selling price:</strong> {product.price_bdt === null ? "Pending confirmation" : `৳${Number(product.price_bdt).toLocaleString("en-BD")}`} · <strong>Product status:</strong> {product.status}</div>
    <details className="admin-editor" open={variants.length === 0}><summary>Add option</summary><form action={createProductVariant} className="admin-form-grid">
      <input type="hidden" name="productId" value={productId} />
      <label>Option name<input name="name" required maxLength={120} placeholder="6V · 300 RPM" /></label>
      <label>Option SKU (optional)<input name="sku" maxLength={100} /></label>
      <label>Price override (BDT, optional)<input name="priceOverrideBdt" type="number" min="1" max="1000000000" step="1" placeholder="Uses base product price" /></label>
      <label>Sort order<input name="sortOrder" type="number" defaultValue="0" min="-100000" max="100000" /></label>
      <label className="admin-full-field">Option values (JSON object)<textarea name="optionValues" rows={4} defaultValue={optionTemplate} required maxLength={2000} /></label>
      <label className="admin-check"><input name="isActive" type="checkbox" /> Publish this option to customers</label>
      <div className="admin-full-field"><button className="button button-primary" type="submit">Create option</button></div>
    </form></details>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Option</th><th>Option price</th><th>Visibility</th><th>Update</th></tr></thead><tbody>
      {variants.length === 0 ? <tr><td colSpan={4}>No options configured. A product without options uses its base price.</td></tr> : variants.map((variant) => <tr key={variant.id}>
        <td><strong>{variant.name}</strong><small>{variant.sku || "No option SKU"}</small><small><code>{JSON.stringify(variant.option_values)}</code></small></td>
        <td>{variant.price_override_bdt === null ? "Base price" : `৳${Number(variant.price_override_bdt).toLocaleString("en-BD")}`}</td>
        <td>{variant.is_active ? "Published" : "Inactive"}</td>
        <td><details><summary>Edit option</summary><form action={updateProductVariant} className="admin-inline-form">
          <input type="hidden" name="productId" value={productId} /><input type="hidden" name="variantId" value={variant.id} />
          <label>Name<input name="name" required maxLength={120} defaultValue={variant.name} /></label>
          <label>SKU<input name="sku" maxLength={100} defaultValue={variant.sku ?? ""} /></label>
          <label>Price override<input name="priceOverrideBdt" type="number" min="1" max="1000000000" step="1" defaultValue={variant.price_override_bdt ?? ""} /></label>
          <label>Sort order<input name="sortOrder" type="number" defaultValue={variant.sort_order} min="-100000" max="100000" /></label>
          <label>Option values (JSON)<textarea name="optionValues" rows={4} defaultValue={JSON.stringify(variant.option_values, null, 2)} required maxLength={2000} /></label>
          <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked={variant.is_active} /> Published</label>
          <button className="button button-small" type="submit">Save option</button>
        </form></details></td>
      </tr>)}
    </tbody></table></div>
  </section>;
}
