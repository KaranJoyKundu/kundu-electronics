import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cancelOrder, confirmOrderStock, confirmCashOnDeliveryOrder, markCashOnDeliveryCollected, updateFulfilment } from "../actions";
import { formatPriceBdt } from "@/lib/format";

export const metadata: Metadata = { title: "Orders · Admin" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, supabase] = await Promise.all([searchParams, createServerSupabaseClient()]);
  if (!supabase) return <section className="simple-page"><h1>Orders</h1><p>Connect Supabase to view orders.</p></section>;
  const [ordersResult, itemsResult] = await Promise.all([
    supabase.from("orders").select("id,order_number,customer_name,customer_phone,delivery_zone_name_snapshot,delivery_address_line_1,delivery_area,delivery_city,payment_preference,subtotal_bdt,delivery_charge_bdt,total_bdt,order_status,stock_status,payment_status,fulfilment_status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("order_items").select("id,order_id,sku_snapshot,product_name_snapshot,variant_name_snapshot,unit_price_bdt,quantity,line_total_bdt").order("created_at"),
  ]);
  if (ordersResult.error || itemsResult.error) return <section className="simple-page"><h1>Orders</h1><p>Order data is unavailable. Apply the migration and verify staff permissions.</p></section>;
  const orders = ordersResult.data ?? [];
  const groupedItems = new Map<string, typeof itemsResult.data>();
  for (const item of itemsResult.data ?? []) groupedItems.set(item.order_id, [...(groupedItems.get(item.order_id) ?? []), item]);
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">STORE OPERATIONS</span><h1>Orders</h1><p>Orders are created from server-calculated prices. Payment and fulfilment have separate states.</p></div></div>
    {result ? <p className={result === "saved" ? "admin-result-success" : "admin-result-error"} role="status">{result === "saved" ? "Order updated." : "The order action failed. Check its current state and your permissions."}</p> : null}
    {orders.length === 0 ? <div className="notice-panel"><strong>No orders yet</strong><p>Real customer orders will appear here after checkout is configured. No sample orders are generated.</p></div> : orders.map((order) => (
      <article className="admin-order-card" key={order.id}>
        <header><div><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}</span></div><strong>{formatPriceBdt(Number(order.total_bdt))}</strong></header>
        <div className="admin-order-status"><span>Order: <b>{order.order_status === "pending_stock_confirmation" ? "pre-order · awaiting stock drop" : order.order_status.replaceAll("_", " ")}</b></span><span>Stock: <b>{order.stock_status.replaceAll("_", " ")}</b></span><span>Payment: <b>{order.payment_status.replaceAll("_", " ")}</b></span><span>Method: <b>{order.payment_preference === "cash_on_delivery" ? "cash on delivery" : order.payment_preference === "online_payment" ? "online payment" : "legacy / unspecified"}</b></span><span>Fulfilment: <b>{order.fulfilment_status}</b></span></div>
        <div className="admin-order-customer"><strong>{order.customer_name}</strong><span>{order.customer_phone}</span><span>{order.delivery_address_line_1}{order.delivery_area ? `, ${order.delivery_area}` : ""}, {order.delivery_city}</span><span>{order.delivery_zone_name_snapshot}</span></div>
        <ul className="admin-order-items">{(groupedItems.get(order.id) ?? []).map((item) => <li key={item.id}><span>{item.product_name_snapshot}{item.variant_name_snapshot ? ` — ${item.variant_name_snapshot}` : ""} × {item.quantity}</span><strong>{formatPriceBdt(Number(item.line_total_bdt))}</strong></li>)}</ul>
        <div className="admin-order-totals"><span>Subtotal {formatPriceBdt(Number(order.subtotal_bdt))}</span><span>Delivery {formatPriceBdt(Number(order.delivery_charge_bdt))}</span></div>
        <div className="admin-order-actions">
          {order.order_status === "awaiting_payment" && order.payment_preference === "cash_on_delivery" && order.payment_status === "not_submitted" && ["reserved", "confirmed_untracked"].includes(order.stock_status) ? <form action={confirmCashOnDeliveryOrder} className="admin-inline-form"><input type="hidden" name="orderId" value={order.id} /><button className="button button-small" type="submit">Confirm COD order</button></form> : null}
          {order.order_status === "pending_stock_confirmation" ? <form action={confirmOrderStock} className="admin-inline-form"><input type="hidden" name="orderId" value={order.id} /><label>Stock drop note<input name="note" required minLength={3} maxLength={500} /></label><button name="available" value="yes" className="button button-small" type="submit">Stock arrived · enable payment</button><button name="available" value="no" className="button button-small button-secondary" type="submit">Cannot fulfil / cancel</button></form> : null}
          {order.order_status !== "cancelled" && order.order_status !== "confirmed" ? <form action={cancelOrder} className="admin-inline-form"><input type="hidden" name="orderId" value={order.id} /><label>Cancellation reason<input name="reason" required minLength={3} maxLength={500} /></label><button className="button button-small button-secondary" type="submit">Cancel order</button></form> : null}
          {order.order_status === "confirmed" && (order.payment_status === "verified" || (order.payment_preference === "cash_on_delivery" && order.payment_status === "not_submitted")) ? <form action={updateFulfilment} className="admin-inline-form"><input type="hidden" name="orderId" value={order.id} /><label>Move fulfilment to<select name="status"><option value="processing">Processing</option><option value="packed">Packed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select></label><label>Note (optional)<input name="note" maxLength={500} /></label><button className="button button-small" type="submit">Update fulfilment</button></form> : null}
          {order.order_status === "confirmed" && order.payment_preference === "cash_on_delivery" && order.fulfilment_status === "delivered" && order.payment_status === "not_submitted" ? <form action={markCashOnDeliveryCollected} className="admin-inline-form"><input type="hidden" name="orderId" value={order.id} /><button className="button button-small" type="submit">Mark COD collected</button></form> : null}
        </div>
      </article>
    ))}
  </section>;
}
