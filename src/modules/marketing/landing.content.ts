import {
  CircleDollarSign,
  Handshake,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { buildSearchUrl } from "@/modules/search/search-params";
import type { ImageVariant } from "@/shared/ui/atoms/ResponsiveImage";
import type { FooterColumn } from "@/shared/ui/organisms/SiteFooter";
import type { Collection } from "./components/CollectionsSection";
import type { ValueProp } from "./components/ValuePropsSection";

/**
 * All landing-page copy and imagery in one place, so marketing edits never
 * touch component code. Photography is placeholder (Unsplash).
 */

function unsplash(
  id: string,
  widths: number[],
  aspect: number,
): ImageVariant[] {
  return widths.map((width) => {
    const height = Math.round(width / aspect);
    return {
      width,
      height,
      url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${width}&h=${height}`,
    };
  });
}

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
