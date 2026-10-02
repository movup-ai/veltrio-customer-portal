import type { CSSProperties } from "react";
import { isHexColor, readableOn } from "@/shared/lib/color";
import { tenantUrl } from "@/shared/lib/tenant";
import type { Company, CompanyBranding } from "./types";

/** Up to two initials for a company avatar, e.g. "Coastline Exotics" -> "CE". */
export function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** URL of the company's storefront on its own subdomain. */
export function companyHref(company: Pick<Company, "subdomain">) {
  return tenantUrl(company.subdomain);
}

const regionNames = new Intl.DisplayNames("en", { type: "region" });

/** "US" -> "United States". Unknown codes are returned as they are. */
export function countryName(code: string) {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Re-points the design tokens at a company's brand colours for everything
 * inside the element this style is set on. Invalid colours are ignored.
 */
export function brandTheme(branding: CompanyBranding): CSSProperties {
  const theme: Record<string, string> = {};
  if (isHexColor(branding.primaryColor)) {
    theme["--color-primary"] = branding.primaryColor;
    theme["--color-primary-hover"] =
      `color-mix(in srgb, ${branding.primaryColor} 85%, black)`;
    theme["--color-on-primary"] = readableOn(branding.primaryColor);
  }
  if (isHexColor(branding.backgroundColor)) {
    theme["--color-background"] = branding.backgroundColor;
  }
  return theme;
}
