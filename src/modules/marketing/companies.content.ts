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
import { siteConfig } from "@/shared/config/site";
import type { ComparisonSide } from "./components/ComparisonSection";
import type { Faq } from "./components/FaqSection";
import type { Feature } from "./components/FeatureCard";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { PricingPlan } from "./components/PricingSection";
import { COMPANIES_PATH, hostCta } from "./landing.content";

/** All copy and prices of the page for rental companies, so edits never touch component code. */

export { COMPANIES_PATH };

export const companiesHero = {
  description:
    "One subscription covers the software that runs your fleet and your listing on the marketplace. We take 0% of every booking.",
  image: hostCta.image,
};

/** What listing on the marketplace adds to the software. */
export const marketplaceBenefits: Feature[] = [
  {
    icon: Search,
    title: "Renters find you",
    description:
      "Your vehicles appear when renters search by city and dates, with no extra data entry.",
  },
  {
    icon: Globe,
    title: "Your own branded page",
    description: `A page for your fleet at yourcompany.${siteConfig.rootDomain}, under your name and your terms.`,
  },
  {
    icon: ThumbsUp,
    title: "You approve every booking",
    description:
      "Each request waits for your answer. Nothing is charged until you confirm it.",
  },
  {
    icon: Wallet,
    title: "Paid straight to you",
    description:
      "Connect your Stripe account and every payment is paid out to it. We never hold your money.",
  },
];

export const comparison: { others: ComparisonSide; ours: ComparisonSide } = {
  others: {
    title: "Typical marketplaces",
    points: [
      "Take a commission on every booking",
      "Add a service fee on top of your price",
      "Collect the payment, then pay you out later",
      "Leave you to buy fleet software separately",
    ],
  },
  ours: {
    title: "Veltrio",
    points: [
      "0% commission, on one flat subscription",
      "No renter fees: renters pay the price you set",
      "Payments go straight to your Stripe account",
      "Fleet software included in every plan",
    ],
  },
};

/** What the company software does, apart from the marketplace. */
export const softwareFeatures: Feature[] = [
  {
    icon: CarFront,
    title: "Fleet",
    description:
      "Every vehicle with its photos, specs and features in one place.",
  },
  {
    icon: CalendarDays,
    title: "Bookings and calendar",
    description:
      "Accept requests and see which car is out, and when, at a glance.",
  },
  {
    icon: Tags,
    title: "Pricing",
    description:
      "Hourly, daily, weekly and monthly rates, deposits and long-rental discounts.",
  },
  {
    icon: Users,
    title: "Customers",
    description:
      "Renter details, driving licence and insurance documents, checked before you confirm.",
  },
  {
    icon: FileSignature,
    title: "Rental agreements",
    description: "Send the agreement and have it signed online before pick-up.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description:
      "Send a secure payment link, take cash at pick-up, and issue receipts.",
  },
  {
    icon: MapPin,
    title: "Branches",
    description:
      "Run several locations, each with its own address and opening hours.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Your bookings and fleet at a glance.",
  },
];

export const gettingStarted: HowItWorksStep[] = [
  {
    title: "Create your account",
    description: "Sign up as a rental company and start your 7-day free trial.",
  },
  {
    title: "Add your vehicles",
    description: "Upload photos, set your rates, deposit and rental terms.",
  },
  {
    title: "Connect Stripe",
    description:
      "Link your Stripe account so renters' payments are paid out to you.",
  },
  {
    title: "Go live",
    description:
      "Your fleet is listed on the marketplace and booking requests start arriving.",
  },
];

/** The portal's sign-up page, where a free trial starts; unset until the portal's address is. */
export const signUpHref =
  siteConfig.portalUrl && new URL("/sign-up", siteConfig.portalUrl).href;

const trialCta = signUpHref && {
  label: "Start free trial",
  href: signUpHref,
};

/** A session with the team when one can be booked, else an email. */
const salesHref =
  siteConfig.demoUrl ??
  (siteConfig.supportEmail && `mailto:${siteConfig.supportEmail}`);

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$39",
    period: "per month",
    description: "For new and small fleets.",
    features: ["Up to 5 vehicles", "1 branch", "Marketplace listing"],
    cta: trialCta || undefined,
  },
  {
    name: "Growth",
    price: "$99",
    period: "per month",
    description: "For growing rental companies.",
    features: ["Up to 25 vehicles", "Up to 3 branches", "Marketplace listing"],
    cta: trialCta || undefined,
    featured: true,
  },
  {
    name: "Pro",
    price: "$199",
    period: "per month",
    description: "For established, multi-branch fleets.",
    features: [
      "Up to 75 vehicles",
      "Unlimited branches",
      "Marketplace listing",
    ],
    cta: trialCta || undefined,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large fleets with needs of their own.",
    features: [
      "More than 75 vehicles",
      "Unlimited branches",
      "Guided onboarding with our team",
    ],
    cta: salesHref ? { label: "Talk to sales", href: salesHref } : undefined,
  },
];

export const pricingNote =
  "Every plan starts with a 7-day free trial and includes the full software, online payments through Stripe and 0% commission on bookings.";

export const companyFaqs: Faq[] = [
  {
    question: "What does Veltrio cost?",
    answer:
      "A flat monthly subscription based on the size of your fleet. There is no commission and no charge per booking.",
  },
  {
    question: "Does Veltrio take a share of my bookings?",
    answer:
      "No. Renters pay the price you set, and all of it is yours. Our only income is your subscription.",
  },
  {
    question: "How do I get paid?",
    answer:
      "You connect your own Stripe account, and renters' online payments are paid out to it. Stripe charges its standard processing fee. You can also take cash at pick-up.",
  },
  {
    question: "Who can list on Veltrio?",
    answer:
      "Rental companies only. Veltrio is for businesses that rent out vehicles; private owners cannot list a personal car.",
  },
  {
    question: "Can I decline a booking request?",
    answer:
      "Yes. Every request waits for your confirmation, and the renter is not charged until you accept it.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan starts with a 7-day free trial, so you can add your fleet and take bookings before you pay.",
  },
];

/** Closes the page; shown only once there is a portal to sign up on. */
export const signUpCta = {
  eyebrow: "Ready to list?",
  title: "Put your fleet in front of renters today.",
  description:
    "Start your 7-day free trial, add your vehicles and keep 100% of every booking.",
  cta: { label: "Start free trial", href: signUpHref ?? "" },
  image: hostCta.image,
};
