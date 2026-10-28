const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "BDT";
const locale = process.env.NEXT_PUBLIC_LOCALE ?? "en-BD";

const priceFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/** Format a price for display, e.g. 1290 → "৳1,290". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
