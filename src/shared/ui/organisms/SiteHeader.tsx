"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteHref } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/atoms/Logo";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/design", label: "Design System" },
];

interface SiteHeaderProps {
  /**
   * `overlay` floats transparently over a hero image and turns solid once the page scrolls.
   * `solid` is the default for every other page.
   */
  variant?: "solid" | "overlay";
}

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
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
        <nav aria-label="Primary" className="ml-4 hidden gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={siteHref(link.href)}
              className="flex h-10 items-center rounded-full px-4 text-sm font-medium hover:bg-current/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href={siteHref("/for-companies")}
          className="ml-auto flex h-10 items-center rounded-full px-4 text-sm font-semibold hover:bg-current/10"
        >
          List your fleet
        </Link>
      </div>
    </header>
  );
}
