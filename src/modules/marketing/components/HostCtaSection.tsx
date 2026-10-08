import Link from "next/link";
import { Button } from "@/shared/ui/atoms/Button";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

interface HostCtaSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  image: { variants: ImageVariant[]; alt: string };
}

/** A photo banner with one call to action, e.g. inviting rental companies to list their fleet. */
export function HostCtaSection({
  eyebrow,
  title,
  description,
  cta,
  image,
}: HostCtaSectionProps) {
  return (
    <section
      aria-labelledby="host-cta-heading"
      className="relative isolate flex min-h-80 items-center overflow-hidden rounded-xl bg-surface-inverse text-on-inverse"
    >
      <ResponsiveImage
        variants={image.variants}
        alt={image.alt}
        sizes="(min-width: 1360px) 1280px, 100vw"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-night/95 via-night/65 to-night/10"
      />
      <div className="max-w-xl p-6 md:p-14">
        <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
        <h2
          id="host-cta-heading"
          className="mt-4 font-display text-h3 md:text-h2"
        >
          {title}
        </h2>
        <p className="mt-4 mb-6 text-on-inverse/80">{description}</p>
        <Button asChild variant="light">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </section>
  );
}
