export interface TelegramOrderLine {
  name: string;
  variant?: string | null;
  sku?: string | null;
  quantity: number;
  lineTotalBdt: number;
}

export interface TelegramOrderNotification {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  addressLine: string;
  area?: string | null;
  city: string;
  deliveryZone?: string | null;
  orderStatus: string;
  stockStatus: string;
  paymentStatus: string;
  subtotalBdt: number;
  deliveryBdt: number;
  totalBdt: number;
  createdAt: string;
  items: TelegramOrderLine[];
  adminUrl: string;
}

export function escapeTelegramHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function price(value: number): string {
  return Number.isFinite(value) ? `৳${Math.round(value).toLocaleString("en-BD")}` : "N/A";
}

export function formatTelegramOrderMessage(order: TelegramOrderNotification): string {
  const items = order.items.map((item) => {
    const name = escapeTelegramHtml(item.name);
    const variant = item.variant ? ` · ${escapeTelegramHtml(item.variant)}` : "";
    const sku = item.sku ? ` [${escapeTelegramHtml(item.sku)}]` : "";
    return `• ${name}${variant}${sku} × ${item.quantity} — ${price(item.lineTotalBdt)}`;
  }).join("\n");
  const address = [order.addressLine, order.area, order.city, order.deliveryZone]
    .filter(Boolean).map((part) => escapeTelegramHtml(part as string)).join(", ");
  const text = [
    "🛒 <b>NEW KUNDU ELECTRONICS ORDER</b>",
    "",
    `📦 <b>Order:</b> ${escapeTelegramHtml(order.orderNumber)}`,
    `🕒 ${escapeTelegramHtml(order.createdAt)}`,
    "",
    "👤 <b>Customer</b>",
    `Name: ${escapeTelegramHtml(order.customerName)}`,
    `Phone: ${escapeTelegramHtml(order.customerPhone)}`,
    ...(order.customerEmail ? [`Email: ${escapeTelegramHtml(order.customerEmail)}`] : []),
    `Address: ${address}`,
    "",
    "🧾 <b>Items</b>",
    items || "• (item details unavailable)",
    "",
    `Subtotal: ${price(order.subtotalBdt)}`,
    `Delivery: ${price(order.deliveryBdt)}`,
    `💰 <b>Total: ${price(order.totalBdt)}</b>`,
    "",
    `Order status: ${escapeTelegramHtml(order.orderStatus.replaceAll("_", " "))}`,
    `Stock status: ${escapeTelegramHtml(order.stockStatus.replaceAll("_", " "))}`,
    `Payment status: ${escapeTelegramHtml(order.paymentStatus.replaceAll("_", " "))}`,
    "",
    `🔗 <a href="${escapeTelegramHtml(order.adminUrl)}">Open admin orders</a>`,
  ].join("\n");
  return text.length <= 3900 ? text : `${text.slice(0, 3850)}\n… message shortened`;
}

export async function sendTelegramMessage(token: string, chatId: string, message: string): Promise<{ ok: boolean; failureCode?: string }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { ok: false, failureCode: `http-${response.status}` };
    const body = await response.json() as { ok?: boolean; error_code?: number };
    return body.ok ? { ok: true } : { ok: false, failureCode: `telegram-${body.error_code ?? "unknown"}` };
  } catch {
    return { ok: false, failureCode: "network-or-timeout" };
  }
}
