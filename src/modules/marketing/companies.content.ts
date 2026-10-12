import {
  CalendarDays,
  CarFront,
  CreditCard,
  FileSignature,
  Globe,
  LayoutDashboard,
  MapPin,
  Search,
  Tags,
  ThumbsUp,
  Users,
  Wallet,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import { siteConfig } from "@/shared/config/site";
import { unsplash } from "@/shared/lib/unsplash";
import type { ComparisonSide } from "./components/ComparisonSection";
import type { Faq } from "./components/FaqSection";
import type { Feature } from "./components/FeatureCard";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { PricingPlan } from "./components/PricingSection";
import { COMPANIES_PATH } from "./landing.content";

/**
 * The page for rental companies: its structure, links and prices here, its words in
 * messages/<locale>/companies.json.
 */

export { COMPANIES_PATH };

type Translator = ReturnType<typeof useTranslations<"companies">>;

/** The portal's sign-up page, where a free trial starts; unset until the portal's address is. */
export const signUpHref =
  siteConfig.portalUrl && new URL("/sign-up", siteConfig.portalUrl).href;

/** A session with the team when one can be booked, else an email. */
const salesHref =
  siteConfig.demoUrl ??
  (siteConfig.supportEmail && `mailto:${siteConfig.supportEmail}`);

const IMAGE = unsplash("1492144534655-ae79c964c9d7", [800, 1600], 16 / 7);
const POINTS = ["commission", "fee", "payout", "software"] as const;
const STEPS = ["account", "vehicles", "stripe", "live"] as const;
const FAQS = ["cost", "share", "paid", "who", "decline", "trial"] as const;

/** Everything the page for rental companies says, in the reader's language. */
export function companiesContent(t: Translator) {
  const image = { variants: IMAGE, alt: t("imageAlt") };
  const benefit = (
    key: "find" | "page" | "approve" | "paid",
    icon: Feature["icon"],
  ): Feature => ({
    icon,
    title: t(`marketplace.benefits.${key}.title`),
    description: t(`marketplace.benefits.${key}.description`, {
      domain: siteConfig.rootDomain,
    }),
  });
  const feature = (
    key:
      | "fleet"
      | "bookings"
      | "pricing"
      | "customers"
      | "agreements"
      | "payments"
      | "branches"
      | "dashboard",
    icon: Feature["icon"],
  ): Feature => ({
    icon,
    title: t(`software.features.${key}.title`),
    description: t(`software.features.${key}.description`),
  });
  const side = (key: "others" | "ours"): ComparisonSide => ({
    title: t(`comparison.${key}.title`),
    points: POINTS.map((point) => t(`comparison.${key}.${point}`)),
  });
  const trialCta = signUpHref
    ? { label: t("pricing.startTrial"), href: signUpHref }
    : undefined;
  const listing = t("pricing.features.listing");
  const unlimited = t("pricing.features.unlimitedBranches");
  const upTo = (count: number) => t("pricing.features.vehiclesUpTo", { count });
  const branches = (count: number) => t("pricing.features.branches", { count });

  /** Prices are set here; a plan's name is its brand and is not translated. */
  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "$39",
      period: t("pricing.perMonth"),
      description: t("pricing.plans.starter"),
      features: [upTo(5), branches(1), listing],
      cta: trialCta,
    },
    {
      name: "Growth",
      price: "$99",
      period: t("pricing.perMonth"),
      description: t("pricing.plans.growth"),
      features: [upTo(25), branches(3), listing],
      cta: trialCta,
      featured: true,
    },
    {
      name: "Pro",
      price: "$199",
      period: t("pricing.perMonth"),
      description: t("pricing.plans.pro"),
      features: [upTo(75), unlimited, listing],
      cta: trialCta,
    },
    {
      name: "Enterprise",
      price: t("pricing.custom"),
      description: t("pricing.plans.enterprise"),
      features: [
        t("pricing.features.vehiclesMoreThan", { count: 75 }),
        unlimited,
        t("pricing.features.onboarding"),
      ],
      cta: salesHref
        ? { label: t("pricing.talkToSales"), href: salesHref }
        : undefined,
    },
  ];

  return {
    companiesHero: { description: t("hero.description"), image },
    /** What listing on the marketplace adds to the software. */
    marketplaceBenefits: [
      benefit("find", Search),
      benefit("page", Globe),
      benefit("approve", ThumbsUp),
      benefit("paid", Wallet),
    ],
    comparison: { others: side("others"), ours: side("ours") },
    /** What the company software does, apart from the marketplace. */
    softwareFeatures: [
      feature("fleet", CarFront),
      feature("bookings", CalendarDays),
      feature("pricing", Tags),
      feature("customers", Users),
      feature("agreements", FileSignature),
      feature("payments", CreditCard),
      feature("branches", MapPin),
      feature("dashboard", LayoutDashboard),
    ],
    gettingStarted: STEPS.map((key): HowItWorksStep => ({
      title: t(`start.steps.${key}.title`),
      description: t(`start.steps.${key}.description`),
    })),
    pricingPlans,
    pricingNote: t("pricing.note"),
    companyFaqs: FAQS.map((key): Faq => ({
      question: t(`faq.items.${key}.question`),
      answer: t(`faq.items.${key}.answer`),
    })),
    /** Closes the page; shown only once there is a portal to sign up on. */
    signUpCta: {
      eyebrow: t("signUp.eyebrow"),
      title: t("signUp.title"),
      description: t("signUp.description"),
      cta: { label: t("signUp.cta"), href: signUpHref ?? "" },
      image,
    },
  };
}
