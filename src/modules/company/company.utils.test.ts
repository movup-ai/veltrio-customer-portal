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
    expect(css).toContain("--color-heading:#111827");
    expect(css).toContain("main :is(h2,h3){color:var(--color-heading)}");
    expect(css).toContain("--color-on-primary:#0f1012");
  });

  it("keeps body text neutral for the background", () => {
    const css = brandThemeCss({
      ...brand,
      backgroundColor: "#140000",
      textColor: "#FFEA00",
    });
    expect(css).toContain(
      "--color-foreground:color-mix(in srgb, #ffffff 92%, #140000)",
    );
    expect(css).not.toContain("--color-foreground:#FFEA00");
    // Surfaces follow, so text on cards and badges does not vanish.
    expect(css).toContain(
      "--color-surface:color-mix(in srgb, #140000 88%, white)",
    );
  });

  it("colours rates with the primary only when it reads on the page", () => {
    expect(
      brandThemeCss({
        ...brand,
        backgroundColor: "#140000",
        primaryColor: "#9EFFF9",
      }),
    ).toContain("--color-price:#9EFFF9");
    expect(brandThemeCss({ ...brand, primaryColor: "#EB1DD0" })).not.toContain(
      "--color-price",
    );
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
