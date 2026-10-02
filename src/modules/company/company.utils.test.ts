import { describe, expect, it } from "vitest";
import { brandThemeCss } from "./company.utils";
import type { CompanyBranding } from "./types";

const branding: CompanyBranding = {
  logoUrl: null,
  coverImage: [],
  primaryColor: "#eb1dd0",
  backgroundColor: "#f3f6f5",
  motto: null,
};

describe("brandThemeCss", () => {
  it("points the primary and background tokens at the brand colours", () => {
    const css = brandThemeCss(branding);
    expect(css).toContain("--color-primary:#eb1dd0");
    expect(css).toContain("--color-background:#f3f6f5");
    expect(css).toContain("--color-on-primary:#0f1012");
  });

  it("ignores values that are not hex colours", () => {
    expect(
      brandThemeCss({
        ...branding,
        primaryColor: "red;}body{display:none",
        backgroundColor: "",
      }),
    ).toBeNull();
  });
});
