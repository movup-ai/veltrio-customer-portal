import { defineRouting } from "next-intl/routing";
import { siteConfig } from "@/shared/config/site";

/** The site's host without a port; a cookie's domain cannot carry one. */
const hostname = siteConfig.rootDomain.split(":")[0];

/**
 * English lives at the addresses it always had; every other language gets a prefix:
 * /search and /es/search, on the marketplace and on each company subdomain alike.
 */
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // One choice for the marketplace and every company subdomain; browsers refuse this on localhost.
  localeCookie:
    hostname === "localhost" ? undefined : { domain: `.${hostname}` },
  // Pages name their own translations once they have them.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
