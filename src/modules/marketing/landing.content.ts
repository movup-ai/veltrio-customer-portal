import {
  BadgePercent,
  CalendarCheck,
  Handshake,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import {
  ECONOMY_MAX_PRICE,
  type CollectionId,
} from "@/modules/search/collections";
import { PRIVACY_PATH, TERMS_PATH } from "@/modules/legal/legal";
import { siteConfig } from "@/shared/config/site";
import { unsplash } from "@/shared/lib/unsplash";
import type { FooterColumn } from "@/shared/ui/organisms/SiteFooter";
import type { Collection } from "./components/CollectionsSection";
import type { Faq } from "./components/FaqSection";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { TrustPoint } from "./components/TrustStrip";
import type { Feature } from "./components/FeatureCard";
import type { CollectionTile } from "./landing.utils";

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

/** Each collection's photo; its words are in the landing and search messages. */
const COLLECTION_PHOTOS: Record<CollectionId, string> = {
  exotic: "1511919884226-fd3cad34687c",
  electric: "1617788138017-80ad40651399",
  economy: "1549317661-bd32c8ce0db2",
  family: "1533473359331-0135ef1b58bf",
};

/** The landing page's collection tiles, in the reader's language. */
export function collectionCards(
  t: Translator<"landing">,
  /** Names a collection, as the search filter does. */
  name: (collection: CollectionId) => string,
  tiles: CollectionTile[],
): Collection[] {
  return tiles.map(({ collection, href }) => ({
    title: name(collection),
    description: t(`collections.items.${collection}.description`, {
      price: ECONOMY_MAX_PRICE,
    }),
    href,
    image: {
      variants: unsplash(COLLECTION_PHOTOS[collection], [600, 1200], 3 / 4),
      alt: t(`collections.items.${collection}.alt`),
    },
  }));
}

/** The page that explains Veltrio to rental companies. */
export const COMPANIES_PATH = "/for-rental-companies";
/** Plans and prices for rental companies. */
export const PRICING_PATH = "/pricing";

const STEPS = ["find", "request", "confirm", "pickUp"] as const;
const FAQS = [
  "who",
  "fee",
  "money",
  "pay",
  "need",
  "deposit",
  "return",
  "drivers",
  "cancel",
  "pickup",
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
      variants: unsplash(
        "1529369623266-f5264b696110",
        [800, 1600, 2400],
        16 / 9,
      ),
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
          { url: "/images/how-it-works.jpg", width: 5357, height: 3164 },
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
        { href: "/#collections", label: t("footer.explore.collections") },
        { href: "/#companies", label: t("footer.explore.companies") },
      ],
    },
    {
      title: t("footer.forCompanies.title"),
      links: [
        { href: COMPANIES_PATH, label: t("footer.forCompanies.list") },
        {
          href: PRICING_PATH,
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
  /** Beside the copyright line. */
  const legalLinks = [
    { href: TERMS_PATH, label: t("footer.terms") },
    { href: PRIVACY_PATH, label: t("footer.privacy") },
    ...(siteConfig.supportEmail
      ? [
          {
            href: `mailto:${siteConfig.supportEmail}`,
            label: t("footer.contact"),
          },
        ]
      : []),
  ];
  return { columns, legalLinks };
}
