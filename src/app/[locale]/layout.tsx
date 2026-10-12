import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { footerContent } from "@/modules/marketing/landing.content";
import { siteConfig } from "@/shared/config/site";
import { OG_LOCALE } from "@/shared/lib/seo";
import { SiteFooter } from "@/shared/ui/organisms/SiteFooter";
import "@/styles/globals.css";
import { ClientMessages } from "@/i18n/ClientMessages";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-jetbrains-mono",
});

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Pick<RootLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "common.site" });
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: `%s | ${siteConfig.name}` },
    description: t("description"),
    applicationName: siteConfig.name,
    openGraph: {
      siteName: siteConfig.name,
      locale: OG_LOCALE[locale],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
};

/** Lets pages that need nothing from the request be built ahead of time, in every language. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const footer = footerContent(t);

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="group/page">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-foreground px-4 py-2 text-on-inverse focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("skipToContent")}
        </a>
        <ClientMessages>
          {children}
          <SiteFooter {...footer} />
        </ClientMessages>
      </body>
    </html>
  );
}
