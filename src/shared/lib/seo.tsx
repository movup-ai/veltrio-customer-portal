import type { Metadata } from "next";
import type { Thing, WithContext } from "schema-dts";
import { siteConfig } from "@/shared/config/site";

interface PageSeo {
  title: string;
  description: string;
  /** Path on this site, e.g. "/cars/miami". Becomes the canonical URL. */
  path: string;
}

/** Per-page metadata with canonical URL and Open Graph. Resolved against `metadataBase` in the root layout. */
export function buildMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
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
