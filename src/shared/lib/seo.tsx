import type { Metadata } from "next";
import type { Thing, WithContext } from "schema-dts";
import { localizeHref } from "@/i18n/href";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";

/** Open Graph's name for each language the site is in. */
export const OG_LOCALE: Record<string, string> = { en: "en_US", es: "es_US" };

interface PageSeo {
  title: string;
  description: string;
  /** Path on this site, e.g. "/cars/miami", or an absolute URL on a company subdomain. Becomes the canonical URL. */
  path: string;
  /** Social preview image. Falls back to the site-wide Open Graph image. */
  image?: string;
  /**
   * Whose page this is in link previews. Set to the company's name on its
   * subdomain; this also drops the "| Veltrio" suffix from the title.
   */
  siteName?: string;
  /**
   * The language the page is rendered in, once its text is translated: the page then names
   * itself as the original and lists its other languages. Left out, the English page is.
   */
  locale?: string;
}

/** Per-page metadata with canonical URL and Open Graph. Resolved against `metadataBase` in the root layout. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  siteName,
  locale,
}: PageSeo): Metadata {
  const url = locale ? localizeHref(path, locale) : path;
  const languages = locale && {
    ...Object.fromEntries(
      routing.locales.map((each) => [each, localizeHref(path, each)]),
    ),
    "x-default": path,
  };
  return {
    title: siteName ? { absolute: title } : title,
    description,
    alternates: { canonical: url, ...(languages && { languages }) },
    openGraph: {
      title,
      description,
      url,
      siteName: siteName ?? siteConfig.name,
      locale: locale ? OG_LOCALE[locale] : siteConfig.locale,
      type: "website",
      ...(image && { images: [image] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

/** Renders schema.org structured data. `data` is type-checked by schema-dts. */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
