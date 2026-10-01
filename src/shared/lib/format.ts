/** Formats an integer amount of cents as whole currency units, e.g. 31900 -> "$319". */
export function formatMoney(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
