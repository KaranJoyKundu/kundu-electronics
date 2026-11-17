import { business } from "@/config/business";

const moneyFormatter = new Intl.NumberFormat(business.currency.locale, {
  style: "currency",
  currency: business.currency.code,
  maximumFractionDigits: 0,
});

export function formatPriceBdt(amount: number | null): string {
  if (amount === null) return "Price on request";
  if (!Number.isFinite(amount) || amount < 0) return "Price unavailable";
  return moneyFormatter.format(amount).replace("BDT", business.currency.symbol).replace(/\s+/g, "");
}
