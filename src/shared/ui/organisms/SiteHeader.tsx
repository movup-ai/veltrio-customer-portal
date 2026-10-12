"use client";

import { Link } from "@/i18n/Link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { siteHref } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/atoms/Logo";
import { LanguageSwitch } from "@/shared/ui/molecules/LanguageSwitch";

const NAV_LINK =
  "h-10 items-center rounded-full px-2.5 text-sm font-semibold whitespace-nowrap hover:bg-current/10 sm:px-4";

interface SiteHeaderProps {
  /**
   * `overlay` floats transparently over a hero image and turns solid once the page scrolls.
   * `solid` is the default for every other page.
   */
  variant?: "solid" | "overlay";
}

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const t = useTranslations("common.nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = variant === "overlay" && !scrolled;

  return (
    <header
      className={cn(
        "top-0 z-40 h-header-mobile w-full border-b transition-colors duration-300 md:h-header",
        variant === "overlay" ? "fixed" : "sticky",
        transparent
          ? "border-transparent text-on-inverse"
          : "bg-background/90 backdrop-blur-lg",
        !transparent && (scrolled ? "border-border" : "border-transparent"),
      )}
    >
      <div className="container-page flex h-full items-center gap-6">
        <Logo inverse={transparent} />
        <nav aria-label={t("label")} className="ml-auto flex gap-1">
          <Link
            href={siteHref("/how-it-works")}
            className={cn("hidden md:flex", NAV_LINK)}
          >
            {t("howItWorks")}
          </Link>
          <Link
            href={siteHref("/for-rental-companies")}
            className={cn("flex", NAV_LINK)}
          >
            {t("listYourFleet")}
          </Link>
          <LanguageSwitch />
        </nav>
      </div>
    </header>
  );
}
