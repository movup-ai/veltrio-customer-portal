import type { Metadata } from "next";
import type { Thing, WithContext } from "schema-dts";
import { siteConfig } from "@/shared/config/site";

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
}

/** Per-page metadata with canonical URL and Open Graph. Resolved against `metadataBase` in the root layout. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  siteName,
}: PageSeo): Metadata {
  return {
    title: siteName ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteName ?? siteConfig.name,
      locale: siteConfig.locale,
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
