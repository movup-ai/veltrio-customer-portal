import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LegalDocument } from "@/modules/legal/components/LegalDocument";
import { buildMetadata } from "@/shared/lib/seo";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pt-8 pb-16 md:pt-12">
        <LegalDocument document="terms" />
      </main>
    </>
  );
}
