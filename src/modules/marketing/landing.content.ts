import {
  CircleDollarSign,
  Handshake,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { buildSearchUrl } from "@/modules/search/search-params";
import { unsplash } from "@/shared/lib/unsplash";
import type { FooterColumn } from "@/shared/ui/organisms/SiteFooter";
import type { Collection } from "./components/CollectionsSection";
import type { Faq } from "./components/FaqSection";
import type { HowItWorksStep } from "./components/HowItWorksSection";
import type { ValueProp } from "./components/ValuePropsSection";

/**
 * All landing-page copy and imagery in one place, so marketing edits never
 * touch component code. Photography is placeholder (Unsplash).
 */

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

export const valueProps: ValueProp[] = [
  {
    icon: ShieldCheck,
    title: "Professional rental companies",
    description:
      "Every car is listed by an established rental business, not a private owner.",
  },
  {
    icon: ListChecks,
    title: "Compare the terms",
    description:
      "See mileage, deposit and rate options next to the price before you choose.",
  },
  {
    icon: CircleDollarSign,
    title: "Upfront pricing",
    description: "Daily rate, fees and deposit are shown before you book.",
  },
  {
    icon: Handshake,
    title: "Book with the company",
    description:
      "Your booking goes straight to the team that hands you the keys.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    title: "Find your car",
    description:
      "Browse cars from independent rental companies and compare the price, deposit and terms of each.",
  },
  {
    title: "Request to book",
    description:
      "Send your details with a photo of your licence and insurance card. Nothing is charged yet.",
  },
  {
    title: "The company confirms",
    description:
      "The rental company reviews your request, then sends a secure link to pay online, unless you chose to pay cash at pick-up.",
  },
  {
    title: "Pick up and drive",
    description:
      "Sign the rental agreement online and collect the car at the company's branch.",
  },
];

export const faqs: Faq[] = [
  {
    question: "Who am I renting from?",
    answer:
      "A professional rental company, never a private owner. Veltrio lists their vehicles, and your booking and rental agreement are with the company that hands you the keys.",
  },
  {
    question: "When do I pay?",
    answer:
      "Not when you send a request. Once the company accepts it, they send you a secure link to pay online. You can also choose to pay cash at pick-up.",
  },
  {
    question: "What do I need to book?",
    answer:
      "You must be at least 18 and hold a valid driving licence. The booking form asks for your contact details and a photo of your licence and insurance card.",
  },
  {
    question: "Is there a security deposit?",
    answer:
      "Each company sets its own. When a vehicle has one, the amount is shown before you book, and it is released when the car comes back.",
  },
  {
    question: "Can I return the car to a different location?",
    answer:
      "Yes, when the company has more than one branch. You choose the return branch while booking; pick-up is always at the branch where the car is kept.",
  },
];

export const hostCta = {
  eyebrow: "For rental companies",
  title: "Your fleet, in front of people who care what they drive.",
  description:
    "List your vehicles on Veltrio and keep your own pricing, terms and brand.",
  cta: { label: "List your fleet", href: "/for-companies" },
  image: {
    variants: unsplash("1492144534655-ae79c964c9d7", [800, 1600], 16 / 7),
    alt: "White Chevrolet Camaro in a dimly lit garage",
  },
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Drive",
    links: [
      { href: "/search", label: "Explore vehicles" },
      { href: buildSearchUrl({ type: "sport" }), label: "Sports cars" },
      { href: buildSearchUrl({ type: "suv" }), label: "SUVs" },
    ],
  },
  {
    title: "Rental companies",
    links: [{ href: "/for-companies", label: "List your fleet" }],
  },
  {
    title: "Veltrio",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
