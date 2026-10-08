/** Public origin of the marketplace. A deployed build must be told what it is. */
function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Set it to the marketplace's public origin, e.g. https://www.example.com, and rebuild.",
    );
  }
  return "http://localhost:3000";
}

const url = siteUrl();

export const siteConfig = {
  name: "Veltrio",
  title: "Veltrio — Rent from independent car rental companies",
  description:
    "Discover, compare and book rental cars from independent rental companies. Upfront prices, clear terms, one simple booking.",
  url,
  /** Host that company subdomains hang off: the site's host without "www", e.g. "veltrio.autos" for abc-rental.veltrio.autos. */
  rootDomain: new URL(url).host.replace(/^www\./, ""),
  locale: "en_US",
  /** Where rental companies sign up and sign in; links to it are hidden while unset. */
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || undefined,
  /** Where renters write for help; the Contact link is hidden while unset. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || undefined,
} as const;

/** Absolute marketplace URL for a path, so links also work from a company subdomain. */
export function siteHref(path: string) {
  return new URL(path, siteConfig.url).href;
}
