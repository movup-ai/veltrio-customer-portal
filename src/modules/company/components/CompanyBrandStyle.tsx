import { brandThemeCss } from "../company.utils";
import type { CompanyBranding } from "../types";

interface CompanyBrandStyleProps {
  branding: CompanyBranding;
}

/** Themes the whole page (background, header, footer, buttons) in a company's colours. */
export function CompanyBrandStyle({ branding }: CompanyBrandStyleProps) {
  const css = brandThemeCss(branding);
  // Safe to inline: the CSS is built only from validated hex colours.
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}
