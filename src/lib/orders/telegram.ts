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
  paymentPreference?: "cash_on_delivery" | "online_payment" | null;
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

function safeText(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function price(value: number): string {
  return Number.isFinite(value) ? `৳${Math.round(value).toLocaleString("en-BD")}` : "N/A";
}

export function formatTelegramOrderMessage(order: TelegramOrderNotification): string {
  const address = [order.addressLine, order.area, order.city, order.deliveryZone]
    .filter(Boolean).map((part) => escapeTelegramHtml(safeText(part as string, 120))).join(", ");
  const itemLines = order.items.map((item) => {
    const name = escapeTelegramHtml(safeText(item.name, 120));
    const variant = item.variant ? ` · ${escapeTelegramHtml(safeText(item.variant, 80))}` : "";
    const sku = item.sku ? ` [${escapeTelegramHtml(safeText(item.sku, 60))}]` : "";
    return `• ${name}${variant}${sku} × ${Math.max(0, Math.floor(item.quantity))} — ${price(item.lineTotalBdt)}`;
  });

  const head = [
    "🛒 <b>NEW KUNDU ELECTRONICS ORDER</b>",
    "",
    `📦 <b>Order:</b> ${escapeTelegramHtml(safeText(order.orderNumber, 80))}`,
    `🕒 ${escapeTelegramHtml(safeText(order.createdAt, 80))}`,
    "",
    "👤 <b>Customer</b>",
    `Name: ${escapeTelegramHtml(safeText(order.customerName, 120))}`,
    `Phone: ${escapeTelegramHtml(safeText(order.customerPhone, 80))}`,
    ...(order.customerEmail ? [`Email: ${escapeTelegramHtml(safeText(order.customerEmail, 120))}`] : []),
    `Address: ${address}`,
    "",
    "🧾 <b>Items</b>",
  ];
  const totals = [
    "",
    `Subtotal: ${price(order.subtotalBdt)}`,
    `Delivery: ${price(order.deliveryBdt)}`,
    `💰 <b>Total: ${price(order.totalBdt)}</b>`,
    `Payment preference: ${order.paymentPreference === "cash_on_delivery" ? "Cash on delivery" : order.paymentPreference === "online_payment" ? "Online payment" : "Legacy / unspecified"}`,
    "",
    `Order status: ${escapeTelegramHtml(safeText(order.orderStatus.replaceAll("_", " "), 80))}`,
    `Stock status: ${escapeTelegramHtml(safeText(order.stockStatus.replaceAll("_", " "), 80))}`,
    `Payment status: ${escapeTelegramHtml(safeText(order.paymentStatus.replaceAll("_", " "), 80))}`,
    "",
    `🔗 <a href="${escapeTelegramHtml(safeText(order.adminUrl, 400))}">Open admin orders</a>`,
  ];

  const included = [...itemLines];
  const build = () => [...head, ...(included.length ? included : ["• (item details unavailable)"]),
    ...(itemLines.length > included.length ? [`… ${itemLines.length - included.length} more item line(s)`] : []), ...totals].join("\n");
  let message = build();
  // Remove full item lines, never cut markup mid-tag; keep order totals/status/admin link.
  while (message.length > 3900 && included.length) {
    included.pop();
    message = build();
  }
  return message.length <= 3900 ? message : `${[...head.slice(0, 8), "Address: (omitted: message too long)", "", "🧾 <b>Items</b>", "• (details omitted)", ...totals].join("\n")}`;
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
