import {
  BadgePercent,
  CreditCard,
  Globe,
  LayoutDashboard,
  Search,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import { formatMoney } from "@/shared/lib/format";
import { unsplash } from "@/shared/lib/unsplash";
import type { ComparisonSide } from "./components/ComparisonSection";
import type { CreditPackCard } from "./components/CreditPacksSection";
import type { Faq } from "./components/FaqSection";
import type { Feature } from "./components/FeatureCard";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { PricingPlan } from "./components/PricingSection";
import type {
  Screenshot,
  ScreenshotFeature,
} from "./components/ScreenshotFeaturesSection";
import { COMPANIES_PATH, PRICING_PATH } from "./landing.content";
import {
  CREDIT_COST,
  CREDIT_PACKS,
  PLANS,
  TRIAL_CREDITS,
  TRIAL_DAYS,
  centsPerCredit,
  largestPricedFleet,
  startingMonthlyCents,
  yearlyDiscountPercent,
  yearlySavingPercent,
  type Plan,
} from "./plans";

/**
 * The pages for rental companies, /for-rental-companies and /pricing: their structure, links
 * and images here, their words in messages/<locale>/companies.json, their prices in plans.ts.
 */

export { COMPANIES_PATH, PRICING_PATH };

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
const PRICING_FAQS = [
  "trial",
  "yearly",
  "change",
  "size",
  "credits",
  "fees",
] as const;
const MORE = ["drivers", "branches", "languages", "ai", "import"] as const;

type ProductFeature = "calendar" | "site" | "checks" | "payment" | "payouts";
type Shot = Omit<Screenshot, "alt">;

const shot = (name: string, width: number, height: number): Shot => ({
  src: `/marketing/${name}.jpg`,
  width,
  height,
});

/**
 * Captured from the real portal by its tools/auth-showcase with an invented company. The
 * booking site has no Spanish capture yet, so its pictures are in English on Spanish pages.
 */
export const SCREENSHOTS: Record<ProductFeature, { en: Shot; es?: Shot }> = {
  calendar: {
    en: shot("calendar-en", 2396, 1498),
    es: shot("calendar-es", 2396, 1498),
  },
  site: { en: shot("site-en", 2880, 1800) },
  checks: {
    en: shot("booking-checks-en", 1414, 402),
    es: shot("booking-checks-es", 1414, 434),
  },
  payment: { en: shot("pay-detail-en", 972, 1108) },
  payouts: {
    en: shot("booking-detail-en", 840, 1436),
    es: shot("booking-detail-es", 840, 1436),
  },
};

const FEATURES = Object.keys(SCREENSHOTS) as ProductFeature[];

/** The money and limits a sentence may quote, so no copy carries a number of its own. */
function figures() {
  return {
    price: formatMoney(startingMonthlyCents()),
    percent: yearlyDiscountPercent(),
    trialDays: TRIAL_DAYS,
  };
}

/** Everything /for-rental-companies says, in the reader's language. */
export function companiesContent(t: Translator, locale: Locale) {
  const image = { variants: IMAGE, alt: t("imageAlt") };
  const values = figures();
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
  const side = (key: "others" | "ours"): ComparisonSide => ({
    title: t(`comparison.${key}.title`),
    points: POINTS.map((point) => t(`comparison.${key}.${point}`)),
  });

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
    /** The software, a screenshot each, in the reader's language where there is one. */
    productFeatures: FEATURES.map((key): ScreenshotFeature => ({
      id: `feature-${key}`,
      title: t(`product.features.${key}.title`),
      description: t(`product.features.${key}.description`, {
        domain: siteConfig.rootDomain,
      }),
      image: {
        ...(SCREENSHOTS[key][locale] ?? SCREENSHOTS[key].en),
        alt: t(`product.features.${key}.alt`),
      },
    })),
    /** Smaller features, listed under the screenshots. */
    moreFeatures: MORE.map((key) => t(`product.more.items.${key}`)),
    gettingStarted: STEPS.map((key): HowItWorksStep => ({
      title: t(`start.steps.${key}.title`),
      description: t(`start.steps.${key}.description`, values),
    })),
    pricingSummary: {
      description: t("pricingSummary.description", values),
      cta: { label: t("pricingSummary.cta"), href: PRICING_PATH },
    },
    companyFaqs: FAQS.map((key): Faq => ({
      question: t(`faq.items.${key}.question`),
      answer: t(`faq.items.${key}.answer`, values),
    })),
    /** Closes the page; shown only once there is a portal to sign up on. */
    signUpCta: signUpCta(t, image),
  };
}

function signUpCta(
  t: Translator,
  image: { variants: typeof IMAGE; alt: string },
) {
  return {
    eyebrow: t("signUp.eyebrow"),
    title: t("signUp.title"),
    description: t("signUp.description", { trialDays: TRIAL_DAYS }),
    cta: { label: t("signUp.cta"), href: signUpHref ?? "" },
    image,
  };
}

/** One plan's card: its monthly price, what a year costs instead, and its limits. */
function planCard(t: Translator, plan: Plan): PricingPlan {
  const saving = yearlySavingPercent(plan);
  const priced = plan.monthlyCents !== null;
  return {
    name: plan.name,
    price: priced ? formatMoney(plan.monthlyCents!) : t("pricing.custom"),
    period: priced ? t("pricing.perMonth") : undefined,
    priceNote:
      plan.yearlyCents !== null && saving !== null
        ? t("pricing.yearly", {
            price: formatMoney(plan.yearlyCents),
            percent: saving,
          })
        : undefined,
    description: t(`pricing.plans.${plan.id}`),
    features: [
      plan.maxVehicles !== null
        ? t("pricing.features.vehiclesUpTo", { count: plan.maxVehicles })
        : t("pricing.features.vehiclesMoreThan", {
            count: largestPricedFleet(),
          }),
      plan.maxBranches !== null
        ? t("pricing.features.branches", { count: plan.maxBranches })
        : t("pricing.features.unlimitedBranches"),
      t("pricing.features.listing"),
      ...(priced ? [] : [t("pricing.features.onboarding")]),
    ],
    cta: priced
      ? signUpHref
        ? { label: t("pricing.startTrial"), href: signUpHref }
        : undefined
      : salesHref
        ? { label: t("pricing.talkToSales"), href: salesHref }
        : undefined,
    featured: plan.id === "growth",
  };
}

/** Everything /pricing says, in the reader's language. */
export function pricingContent(t: Translator) {
  const values = figures();
  const included = (
    key: "software" | "listing" | "payments" | "commission",
    icon: Feature["icon"],
  ): Feature => ({
    icon,
    title: t(`pricingPage.included.items.${key}.title`),
    description: t(`pricingPage.included.items.${key}.description`),
  });
  return {
    intro: t("pricingPage.intro", values),
    plans: PLANS.map((plan) => planCard(t, plan)),
    plansNote: t("pricingPage.plansNote", values),
    included: [
      included("software", LayoutDashboard),
      included("listing", Globe),
      included("payments", CreditCard),
      included("commission", BadgePercent),
    ],
    credits: {
      packs: CREDIT_PACKS.map((pack): CreditPackCard => ({
        title: t("pricingPage.credits.pack", { count: pack.credits }),
        price: formatMoney(pack.priceCents),
        detail: t("pricingPage.credits.perCredit", {
          price: formatMoney(centsPerCredit(pack)),
        }),
      })),
      costs: [
        t("pricingPage.credits.background", { count: CREDIT_COST.background }),
        t("pricingPage.credits.insurance", { count: CREDIT_COST.insurance }),
        t("pricingPage.credits.identity"),
      ],
      note: t("pricingPage.credits.note", { count: TRIAL_CREDITS }),
    },
    faqs: PRICING_FAQS.map((key): Faq => ({
      question: t(`pricingPage.faq.items.${key}.question`),
      answer: t(`pricingPage.faq.items.${key}.answer`, {
        ...values,
        count: largestPricedFleet(),
        background: CREDIT_COST.background,
        insurance: CREDIT_COST.insurance,
      }),
    })),
    signUpCta: signUpCta(t, {
      variants: IMAGE,
      alt: t("imageAlt"),
    }),
  };
}
