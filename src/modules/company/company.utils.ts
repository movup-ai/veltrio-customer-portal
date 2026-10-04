import { isHexColor, readableOn } from "@/shared/lib/color";
import { tenantUrl } from "@/shared/lib/tenant";
import type { Company, CompanyBrand } from "./types";

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
 * Google Maps embed URL for an address or "lat,lng". Uses the Maps Embed API
 * when NEXT_PUBLIC_GOOGLE_MAPS_KEY is set, and the keyless embed otherwise.
 */
export function mapEmbedSrc(place: string) {
  const query = encodeURIComponent(place);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  return key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}&zoom=14`
    : `https://www.google.com/maps?q=${query}&z=14&output=embed`;
}

/**
 * CSS that re-points the design tokens at a company's brand colours for the
 * whole document. Returns null when no colour is a valid "#rrggbb".
 */
export function brandThemeCss(brand: CompanyBrand): string | null {
  const tokens: Record<string, string> = {};
  const { primaryColor: primary, backgroundColor: background } = brand;
  const text = brand.textColor;
  if (isHexColor(primary)) {
    tokens["--color-primary"] = primary;
    tokens["--color-primary-hover"] =
      `color-mix(in srgb, ${primary} 85%, black)`;
    tokens["--color-on-primary"] = readableOn(primary);
  }
  if (isHexColor(background)) {
    tokens["--color-background"] = background;
    tokens["--color-surface-muted"] =
      `color-mix(in srgb, ${background} 95%, black)`;
    tokens["--color-border"] = `color-mix(in srgb, ${background} 91%, black)`;
  }
  if (isHexColor(text)) {
    tokens["--color-foreground"] = text;
    tokens["--color-foreground-secondary"] = text;
    // Supporting text is the brand text colour, softened toward the page.
    tokens["--color-muted"] =
      `color-mix(in srgb, ${text} 72%, var(--color-background))`;
  }
  const declarations = Object.entries(tokens).map(
    ([name, value]) => `${name}:${value}`,
  );
  return declarations.length ? `:root{${declarations.join(";")}}` : null;
}
