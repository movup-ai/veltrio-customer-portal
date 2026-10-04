import { describe, expect, it } from "vitest";
import { brandThemeCss } from "./company.utils";
import type { CompanyBrand } from "./types";

const brand: CompanyBrand = {
  primaryColor: "#EB1DD0",
  backgroundColor: "#F3F6F5",
  textColor: "#111827",
  headline: null,
  bannerUrl: null,
};

describe("brandThemeCss", () => {
  it("points the primary, background and text tokens at the brand colours", () => {
    const css = brandThemeCss(brand);
    expect(css).toContain("--color-primary:#EB1DD0");
    expect(css).toContain("--color-background:#F3F6F5");
    expect(css).toContain("--color-foreground:#111827");
    expect(css).toContain("--color-on-primary:#0f1012");
  });

  it("ignores values that are not hex colours", () => {
    expect(
      brandThemeCss({
        ...brand,
        primaryColor: "red;}body{display:none",
        backgroundColor: "",
        textColor: "url(x)",
      }),
    ).toBeNull();
  });
});
