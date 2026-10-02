const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "Veltrio",
  title: "Veltrio — Rent from independent car rental companies",
  description:
    "Discover, compare and book rental cars from independent rental companies. Upfront prices, clear terms, one simple booking.",
  url,
  /** Host that company subdomains hang off, e.g. "veltrio.autos" for abc-rental.veltrio.autos. */
  rootDomain:
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    new URL(url).host.replace(/^www\./, ""),
  locale: "en_US",
} as const;

/** Absolute marketplace URL for a path, so links also work from a company subdomain. */
export function siteHref(path: string) {
  return new URL(path, siteConfig.url).href;
}
