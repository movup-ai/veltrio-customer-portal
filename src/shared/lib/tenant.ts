import { siteConfig } from "@/shared/config/site";

/** Subdomains that are never a rental company. */
const RESERVED = new Set(["www", "api", "app"]);

/** "abc-rental.veltrio.autos" -> "abc-rental"; null for the marketplace's own host. */
export function subdomainFromHost(
  host: string | null,
  rootDomain: string = siteConfig.rootDomain,
): string | null {
  if (!host) return null;
  const hostname = host.toLowerCase();
  const suffix = `.${rootDomain.toLowerCase()}`;
  if (!hostname.endsWith(suffix)) return null;
  const label = hostname.slice(0, -suffix.length);
  if (!label || label.includes(".") || RESERVED.has(label)) return null;
  return label;
}

/** Absolute URL on a company's own subdomain, e.g. https://abc-rental.veltrio.autos/vehicles/x. */
export function tenantUrl(subdomain: string, path = "") {
  const { protocol } = new URL(siteConfig.url);
  return `${protocol}//${subdomain}.${siteConfig.rootDomain}${path}`;
}
