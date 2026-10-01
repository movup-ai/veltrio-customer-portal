export const siteConfig = {
  name: "Veltrio",
  title: "Veltrio — Rent from independent car rental companies",
  description:
    "Discover, compare and book rental cars from independent rental companies. Upfront prices, clear terms, one simple booking.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
} as const;
