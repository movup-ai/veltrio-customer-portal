import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/** One file of messages per area of the site, under messages/<locale>/. */
const NAMESPACES = [
  "booking",
  "common",
  "companies",
  "company",
  "landing",
  "search",
  "vehicle",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const files = await Promise.all(
    NAMESPACES.map(
      async (namespace) =>
        [
          namespace,
          (await import(`../../messages/${locale}/${namespace}.json`)).default,
        ] as const,
    ),
  );
  return { locale, messages: Object.fromEntries(files) };
});
