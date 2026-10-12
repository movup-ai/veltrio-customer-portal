import { siteConfig } from "@/shared/config/site";
import { routing } from "./routing";

/** A path, then whatever query and fragment follow it. */
const PATH = /^(\/[^?#]*)(.*)$/;

const prefixed = (path: string, locale: string) =>
  `/${locale}${path === "/" ? "" : path}`;

/**
 * An address in the reader's language: "/es" goes before the path of a page on the marketplace
 * or on a company subdomain. English, and addresses elsewhere (the API, mailto:, #top), are
 * returned as they are.
 */
export function localizeHref(href: string, locale: string) {
  if (locale === routing.defaultLocale) return href;
  const local = PATH.exec(href);
  if (local) return prefixed(local[1]!, locale) + local[2];
  if (!URL.canParse(href)) return href;
  const url = new URL(href);
  const ours =
    url.host === siteConfig.rootDomain ||
    url.host === `www.${siteConfig.rootDomain}` ||
    url.host.endsWith(`.${siteConfig.rootDomain}`);
  if (!ours || !/^https?:$/.test(url.protocol)) return href;
  url.pathname = prefixed(url.pathname, locale);
  return url.toString();
}
