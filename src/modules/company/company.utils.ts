import { contrastRatio, isHexColor, readableOn } from "@/shared/lib/color";
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

/** "US" -> "United States", or "Estados Unidos" in Spanish. Unknown codes are returned as they are. */
export function countryName(code: string, locale = "en") {
  try {
    return new Intl.DisplayNames(locale, { type: "region" }).of(code) ?? code;
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

/** Contrast WCAG AA asks of body-size text. */
const AA = 4.5;

/**
 * CSS that re-points the design tokens at a company's brand colours for the
 * whole document. The brand text colour goes on headings; body text stays a
 * neutral that reads on the brand background. Returns null when no colour is a valid "#rrggbb".
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
    // Three steps of white or near-black, softened toward the page.
    const neutral = readableOn(background);
    // Cards, badges and menus: a step lighter than the page, so the neutral text reads on them too.
    tokens["--color-surface"] =
      `color-mix(in srgb, ${background} ${neutral === "#ffffff" ? 88 : 30}%, white)`;
    tokens["--color-foreground"] =
      `color-mix(in srgb, ${neutral} 92%, ${background})`;
    tokens["--color-foreground-secondary"] =
      `color-mix(in srgb, ${neutral} 80%, ${background})`;
    tokens["--color-muted"] =
      `color-mix(in srgb, ${neutral} 64%, ${background})`;
  }
  // Rates in the primary colour, only where it reads as text on the page.
  const page = isHexColor(background) ? background : "#ffffff";
  if (isHexColor(primary) && (contrastRatio(primary, page) ?? 0) >= AA) {
    tokens["--color-price"] = primary;
  }
  if (isHexColor(text)) tokens["--color-heading"] = text;
  const declarations = Object.entries(tokens).map(
    ([name, value]) => `${name}:${value}`,
  );
  if (!declarations.length) return null;
  const css = `:root{${declarations.join(";")}}`;
  // In the base layer, so a heading with its own colour class keeps it.
  return isHexColor(text)
    ? `${css}@layer base{main :is(h2,h3){color:var(--color-heading)}}`
    : css;
}
