import { brandThemeCss } from "../company.utils";
import type { CompanyBrand } from "../types";

interface CompanyBrandStyleProps {
  brand: CompanyBrand;
}

/** Themes the whole page (background, text, header, footer, buttons) in a company's colours. */
export function CompanyBrandStyle({ brand }: CompanyBrandStyleProps) {
  const css = brandThemeCss(brand);
  // Safe to inline: the CSS is built only from validated hex colours.
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}
