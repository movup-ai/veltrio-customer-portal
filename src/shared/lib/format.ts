/** Formats an amount of cents, showing cents only when there are some: 31900 -> "$319", 32475 -> "$324.75". */
export function formatMoney(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
