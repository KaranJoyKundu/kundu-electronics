import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adjustInventory, configureInventory } from "../actions";

export const metadata: Metadata = { title: "Inventory · Admin" };

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, supabase] = await Promise.all([searchParams, createServerSupabaseClient()]);
  if (!supabase) return <section className="simple-page"><h1>Inventory</h1><p>Connect Supabase to manage stock.</p></section>;
  const [productsResult, inventoryResult] = await Promise.all([
    supabase.from("products").select("id,name,sku,status").order("name"),
    supabase.from("product_inventory").select("product_id,tracking_mode,quantity_on_hand,quantity_reserved,low_stock_threshold,updated_at").order("updated_at", { ascending: false }),
  ]);
  if (productsResult.error || inventoryResult.error) return <section className="simple-page"><h1>Inventory</h1><p>Inventory data is unavailable. Apply the reviewed migration and verify staff access.</p></section>;
  const products = productsResult.data ?? [];
  const stockByProduct = new Map((inventoryResult.data ?? []).map((row) => [row.product_id, row]));
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">PRIVATE OPERATIONS</span><h1>Inventory</h1><p>Unknown is not zero. Untracked stock is not a confirmed quantity.</p></div></div>
    {result ? <p role="status" className={result === "saved" ? "admin-result-success" : "admin-result-error"}>{result === "saved" ? "Inventory updated and movement recorded." : "The inventory change failed. Check quantity, reason and active reservations."}</p> : null}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Tracking</th><th>On hand</th><th>Reserved</th><th>Configure / adjust</th></tr></thead><tbody>
      {products.length === 0 ? <tr><td colSpan={5}>No products to track yet.</td></tr> : products.map((product) => {
        const stock = stockByProduct.get(product.id);
        return <tr key={product.id}>
          <td><strong>{product.name}</strong><small>{product.sku || product.status}</small></td>
          <td>{stock?.tracking_mode ?? "unknown"}</td><td>{stock?.tracking_mode === "tracked" ? stock.quantity_on_hand : "Not tracked"}</td><td>{stock?.quantity_reserved ?? 0}</td>
          <td><details><summary>Open stock controls</summary>
            <form action={configureInventory} className="admin-inline-form">
              <input type="hidden" name="productId" value={product.id} />
              <label>Tracking mode<select name="trackingMode" defaultValue={stock?.tracking_mode ?? "unknown"}><option value="unknown">Unknown</option><option value="untracked">Untracked</option><option value="tracked">Tracked quantity</option></select></label>
              <label>Actual on-hand quantity<input name="quantityOnHand" type="number" min="0" max="1000000000" defaultValue={stock?.tracking_mode === "tracked" ? stock.quantity_on_hand : ""} /></label>
              <label>Low-stock threshold<input name="lowStockThreshold" type="number" min="0" max="1000000000" defaultValue={stock?.low_stock_threshold ?? ""} /></label>
              <label>Reason / source<input name="reason" required minLength={3} maxLength={500} placeholder="Physical count on 13 Nov" /></label>
              <button className="button button-small" type="submit">Save tracking state</button>
            </form>
            {stock?.tracking_mode === "tracked" ? <form action={adjustInventory} className="admin-inline-form">
              <input type="hidden" name="productId" value={product.id} />
              <label>Quantity delta (+/-)<input name="quantityDelta" type="number" required min="-1000000000" max="1000000000" step="1" /></label>
              <label>Reason<input name="reason" required minLength={3} maxLength={500} /></label>
              <button className="button button-small" type="submit">Record adjustment</button>
            </form> : null}
          </details></td>
        </tr>;
      })}
    </tbody></table></div>
    <p className="admin-footnote">Every tracked quantity change requires a reason and is written to private inventory history.</p>
  </section>;
}
