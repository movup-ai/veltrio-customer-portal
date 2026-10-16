import { BadgePercent, CreditCard, Globe, LayoutDashboard } from "lucide-react";
import type { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import { formatMoney } from "@/shared/lib/format";
import { unsplash } from "@/shared/lib/unsplash";
import type { CreditPackCard } from "./components/CreditPacksSection";
import type { Faq } from "./components/FaqSection";
import type { Feature } from "./components/FeatureCard";
import type { PricingPlan } from "./components/PricingSection";
import type {
  BookingStage,
  StoryChapter,
} from "./components/story/StoryChrome";
import type { StoryFigureImage } from "./components/story/StoryParts";
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
/** The same photo, cut taller and larger to fill the title page behind its text. */
const HERO_IMAGE = unsplash(
  "1492144534655-ae79c964c9d7",
  [800, 1600, 2400],
  16 / 10,
);
/** The photo cut to the 1.91:1 of a link preview. */
export const SHARE_IMAGE = unsplash(
  "1492144534655-ae79c964c9d7",
  [1200],
  1200 / 630,
)[0]!.url;
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
type Shot = Omit<StoryFigureImage, "alt" | "caption">;

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

/** The booking the story follows: the one in the screenshots, from the sample company. */
export const SAMPLE_BOOKING = {
  reference: "BK-20431",
  /** The sample company's own booking site, under the marketplace's domain. */
  subdomain: "sunstate",
  vehicle: "Audi R8",
  company: "Sunstate Car Co.",
  paidCents: 230799,
} as const;

export const CHAPTERS = [
  "find",
  "fleet",
  "checks",
  "paid",
  "money",
  "start",
  "cost",
] as const;
export type ChapterKey = (typeof CHAPTERS)[number];
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

/** The screenshot each chapter shows, by the product feature whose words go with it. */
const FIGURES = {
  find: "site",
  fleet: "calendar",
  checks: "checks",
  paid: "payment",
  money: "payouts",
} as const satisfies Partial<Record<ChapterKey, ProductFeature>>;
type FigureChapter = keyof typeof FIGURES;

/** Where the sample booking stands once each chapter is reached, in the product's own statuses. */
const STAGES: Record<
  ChapterKey,
  {
    status: "pending" | "confirmed" | "ready" | "onRental" | "completed";
    step:
      | "requested"
      | "calendar"
      | "checks"
      | "paid"
      | "payout"
      | "handover"
      | "returned";
  }
> = {
  find: { status: "pending", step: "requested" },
  fleet: { status: "confirmed", step: "calendar" },
  checks: { status: "confirmed", step: "checks" },
  paid: { status: "ready", step: "paid" },
  money: { status: "ready", step: "payout" },
  start: { status: "onRental", step: "handover" },
  cost: { status: "completed", step: "returned" },
};

/** How far along the road the car is by a chapter's end: the start at request, the end at return. */
function roadAt(index: number): number {
  // Short of the very end, so the car stays on its road rather than past it.
  return (Math.max(0, index) / (CHAPTERS.length - 1)) * 0.96;
}

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
  const values = figures();
  const domain = { domain: siteConfig.rootDomain };
  const side = (key: "others" | "ours") => ({
    title: t(`comparison.${key}.title`),
    points: POINTS.map((point) => t(`comparison.${key}.${point}`)),
  });
  const stages = CHAPTERS.map((key): BookingStage => ({
    chapterId: `chapter-${key}`,
    status: t(`story.ticket.statuses.${STAGES[key].status}`),
    step: t(`story.ticket.steps.${STAGES[key].step}`),
    tone: STAGES[key].status,
  }));
  const figure = (key: FigureChapter) => {
    const feature = FIGURES[key];
    return {
      title: t(`product.features.${feature}.title`),
      description: t(`product.features.${feature}.description`, domain),
      image: {
        ...(SCREENSHOTS[feature][locale] ?? SCREENSHOTS[feature].en),
        alt: t(`product.features.${feature}.alt`),
        caption: t(`story.captions.${key}`),
      } satisfies StoryFigureImage,
    };
  };

  return {
    hero: {
      image: { variants: HERO_IMAGE, alt: t("imageAlt") },
      description: t("hero.description"),
      facts: [
        t("story.facts.commission"),
        t("story.facts.price", values),
        t("story.facts.trial", values),
      ],
    },
    /** What listing on the marketplace adds to the software. */
    benefits: (["find", "page", "approve", "paid"] as const).map((key) => ({
      title: t(`marketplace.benefits.${key}.title`),
      description: t(`marketplace.benefits.${key}.description`, domain),
    })),
    comparison: { others: side("others"), ours: side("ours") },
    /** For the folio in the margin. */
    chapters: CHAPTERS.map((key, index): StoryChapter => ({
      id: `chapter-${key}`,
      label: t("story.chapterN", { number: NUMERALS[index] ?? index + 1 }),
      title: t(`story.chapters.${key}.folio`),
    })),
    stages,
    /** A chapter's id, its number, the booking's stage there and how far its car has come. */
    chapter: (key: ChapterKey) => {
      const index = CHAPTERS.indexOf(key);
      return {
        road: { from: roadAt(index - 1), to: roadAt(index) },
        id: `chapter-${key}`,
        number: t("story.chapterN", { number: NUMERALS[index] ?? index + 1 }),
        title: t(`story.chapters.${key}.folio`),
        stamp: {
          label: `${t("story.ticket.sample")} ${SAMPLE_BOOKING.reference}`,
          status: stages[index]?.status ?? "",
          tone: STAGES[key].status,
          step: stages[index]?.step ?? "",
        },
      };
    },
    /** The sample company's booking site, as its address bar reads. */
    siteAddress: `${SAMPLE_BOOKING.subdomain}.${siteConfig.rootDomain}`,
    figures: {
      find: figure("find"),
      fleet: figure("fleet"),
      checks: figure("checks"),
      paid: figure("paid"),
      money: figure("money"),
    },
    booking: {
      label: t("story.ticket.sample"),
      reference: SAMPLE_BOOKING.reference,
      vehicle: SAMPLE_BOOKING.vehicle,
    },
    money: {
      paid: formatMoney(SAMPLE_BOOKING.paidCents),
      to: t("story.chapters.money.toValue", {
        company: SAMPLE_BOOKING.company,
      }),
      share: formatMoney(0),
    },
    moreFeatures: MORE.map((key) => t(`product.more.items.${key}`)),
    gettingStarted: STEPS.map((key) => ({
      title: t(`start.steps.${key}.title`),
      description: t(`start.steps.${key}.description`, values),
    })),
    pricingLine: t("pricingSummary.description", values),
    trialLabel: t("story.chapters.cost.trial", values),
    companyFaqs: FAQS.map((key): Faq => ({
      question: t(`faq.items.${key}.question`),
      answer: t(`faq.items.${key}.answer`, values),
    })),
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
