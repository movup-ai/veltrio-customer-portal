import Link from "next/link";
import { siteConfig, siteHref } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";

interface LogoProps {
  /** White tile for use over photography or dark surfaces. */
  inverse?: boolean;
  className?: string;
}

export function Logo({ inverse, className }: LogoProps) {
  return (
    <Link
      href={siteHref("/")}
      aria-label={`${siteConfig.name} home`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect
          width="32"
          height="32"
          rx="9"
          className={cn(
            "transition-colors",
            inverse ? "fill-surface" : "fill-foreground",
          )}
        />
        <path
          d="M8 9.5 16 23l8-13.5"
          fill="none"
          className="stroke-accent"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.4 9.5 16 15.6"
          className={cn(
            "transition-colors",
            inverse ? "stroke-foreground" : "stroke-surface",
          )}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="-mt-0.5 font-display text-[1.875rem] leading-none tracking-tight">
        veltrio
      </span>
    </Link>
  );
}
