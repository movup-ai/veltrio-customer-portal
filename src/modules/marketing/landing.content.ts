import {
  BadgePercent,
  CalendarCheck,
  Handshake,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import { buildSearchUrl } from "@/modules/search/search-params";
import { siteConfig } from "@/shared/config/site";
import { unsplash } from "@/shared/lib/unsplash";
import type { FooterColumn } from "@/shared/ui/organisms/SiteFooter";
import type { Collection } from "./components/CollectionsSection";
import type { Faq } from "./components/FaqSection";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { TrustPoint } from "./components/TrustStrip";
import type { Feature } from "./components/FeatureCard";

/**
 * The landing and how-it-works pages' content in one place: its structure, links and imagery
 * here, its words in messages/<locale>/landing.json. Photography is placeholder (Unsplash).
 */

/** The translator a page hands over, bound to one file of messages. */
type Translator<Namespace extends "common" | "landing"> = ReturnType<
  typeof useTranslations<Namespace>
>;

/** Styleguide samples; no page shows them. */

export const hero = {
  eyebrow: "The car rental marketplace",
  description:
    "Compare cars from independent rental companies. Every price upfront, every term in plain sight, one simple booking.",
  image: {
    variants: unsplash("1603584173870-7f23fdae1b7a", [800, 1600, 2400], 3 / 2),
    alt: "Grey Audi R8 parked on a mountain road at sunset",
  },
};

export const collections: Collection[] = [
  {
    title: "Weekend sports cars",
    description: "Low, loud and built for the long way round",
    href: buildSearchUrl({ type: "sport" }),
    image: {
      variants: unsplash("1511919884226-fd3cad34687c", [600, 1200], 4 / 3),
      alt: "Yellow Lamborghini Huracán parked on a tree-lined street",
    },
  },
  {
    title: "Room for everyone",
    description: "SUVs for families, friends and luggage",
    href: buildSearchUrl({ type: "suv" }),
    image: {
      variants: unsplash("1533473359331-0135ef1b58bf", [600, 1200], 4 / 3),
      alt: "White Ford Expedition on a desert road",
    },
  },
  {
    title: "Top down",
    description: "Convertibles for coast roads",
    href: buildSearchUrl({ type: "convertible" }),
    image: {
      variants: unsplash("1616788494707-ec28f08d05a1", [600, 1200], 4 / 3),
      alt: "Silver Mercedes-AMG GT with a city skyline behind it",
    },
  },
];

/** The page that explains Veltrio to rental companies. */
export const COMPANIES_PATH = "/for-rental-companies";

const STEPS = ["find", "request", "confirm", "pickUp"] as const;
const FAQS = [
  "who",
  "fee",
  "money",
  "pay",
  "need",
  "deposit",
  "return",
] as const;
/** How many questions the landing page repeats; the rest are on the how-it-works page. */
const TOP_FAQS = 5;

const HOST_IMAGE = unsplash("1492144534655-ae79c964c9d7", [800, 1600], 16 / 7);

/** Everything the landing and how-it-works pages say, in the reader's language. */
export function landingContent(t: Translator<"landing">) {
  /** The landing page opens on its search, under the title alone. */
  const intro = {
    title: t("intro.title"),
    image: {
      variants: [{ url: "/images/landing.jpg", width: 5357, height: 3164 }],
      alt: t("intro.imageAlt"),
    },
  };
  const faqs: Faq[] = FAQS.map((key) => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }));
  const value = (
    key: "fees" | "terms" | "professional" | "direct",
    icon: Feature["icon"],
  ): Feature => ({
    icon,
    title: t(`howItWorksPage.values.${key}.title`),
    description: t(`howItWorksPage.values.${key}.description`),
  });
  const trust = (
    key: "noFees" | "noCharge" | "professional",
    icon: TrustPoint["icon"],
  ): TrustPoint => ({
    icon,
    title: t(`trust.${key}.title`),
    description: t(`trust.${key}.description`),
  });

  return {
    intro,
    /** The three promises under the landing page's search. */
    trustPoints: [
      trust("noFees", BadgePercent),
      trust("noCharge", CalendarCheck),
      trust("professional", ShieldCheck),
    ],
    howItWorks: STEPS.map((key): HowItWorksStep => ({
      title: t(`steps.${key}.title`),
      description: t(`steps.${key}.description`),
    })),
    faqs,
    topFaqs: faqs.slice(0, TOP_FAQS),
    hostCta: {
      eyebrow: t("hostCta.eyebrow"),
      title: t("hostCta.title"),
      description: t("hostCta.description"),
      cta: { label: t("hostCta.cta"), href: COMPANIES_PATH },
      image: { variants: HOST_IMAGE, alt: t("hostCta.imageAlt") },
    },
    howItWorksHero: {
      description: t("howItWorksPage.heroDescription"),
      image: {
        variants: [
          { url: "/images/how-it-works.jpg", width: 2000, height: 1335 },
        ],
        alt: t("howItWorksPage.heroImageAlt"),
      },
    },
    valueProps: [
      value("fees", BadgePercent),
      value("terms", ListChecks),
      value("professional", ShieldCheck),
      value("direct", Handshake),
    ],
    valuePropsImage: {
      variants: [{ url: "/images/why-veltrio.jpg", width: 2000, height: 2996 }],
      alt: t("howItWorksPage.whyImageAlt"),
    },
    /** Closes the how-it-works page by sending the reader back to the cars. */
    browseCta: {
      eyebrow: t("howItWorksPage.browseCta.eyebrow"),
      title: t("howItWorksPage.browseCta.title"),
      description: t("howItWorksPage.browseCta.description"),
      cta: { label: t("howItWorksPage.browseCta.cta"), href: "/" },
      image: intro.image,
    },
  };
}

/** The footer of every page. City and company links land on sections of the landing page. */
export function footerContent(t: Translator<"common">) {
  const columns: FooterColumn[] = [
    {
      title: t("footer.explore.title"),
      links: [
        { href: "/search", label: t("footer.explore.vehicles") },
        { href: "/#cities", label: t("footer.explore.cities") },
        { href: "/#companies", label: t("footer.explore.companies") },
      ],
    },
    {
      title: t("footer.forCompanies.title"),
      links: [
        { href: COMPANIES_PATH, label: t("footer.forCompanies.list") },
        {
          href: `${COMPANIES_PATH}#pricing`,
          label: t("footer.forCompanies.pricing"),
        },
        ...(siteConfig.portalUrl
          ? [
              {
                href: siteConfig.portalUrl,
                label: t("footer.forCompanies.signIn"),
              },
            ]
          : []),
      ],
    },
    {
      title: t("footer.veltrio.title"),
      links: [
        { href: "/how-it-works", label: t("footer.veltrio.howItWorks") },
        { href: "/how-it-works#faq", label: t("footer.veltrio.faq") },
      ],
    },
  ];
  /** Beside the copyright line. Privacy and Terms join it once their text exists. */
  const legalLinks = siteConfig.supportEmail
    ? [
        {
          href: `mailto:${siteConfig.supportEmail}`,
          label: t("footer.contact"),
        },
      ]
    : [];
  return { columns, legalLinks };
}
