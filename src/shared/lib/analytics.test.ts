import { describe, expect, it } from "vitest";
import { scrubSearchPlace, withoutSearchPlace } from "./analytics";

describe("withoutSearchPlace", () => {
  it("removes the searched point and its name, wherever they sit", () => {
    const site = "https://veltrio.autos/search";
    expect(
      withoutSearchPlace(`${site}?near=25.762%2C-80.192&place=Brickell+Ave`),
    ).toBe(site);
    expect(
      withoutSearchPlace(
        `${site}?pickup=2026-10-10&near=25.762%2C-80.192&place=Home&type=suv#top`,
      ),
    ).toBe(`${site}?pickup=2026-10-10&type=suv#top`);
    expect(withoutSearchPlace("/search?place=Home&near=1%2C2")).toBe("/search");
  });

  it("leaves everything else as it was", () => {
    for (const text of [
      "https://veltrio.autos/search?location=miami-fl&type=suv",
      "/how-it-works#faq",
      "a place near=here",
      "",
    ]) {
      expect(withoutSearchPlace(text)).toBe(text);
    }
  });
});

describe("scrubSearchPlace", () => {
  it("cleans every text property and ignores the rest", () => {
    const properties = {
      $current_url: "https://veltrio.autos/search?near=1%2C2&type=suv",
      $referrer: "https://veltrio.autos/search?place=Home",
      count: 3,
    };
    scrubSearchPlace(properties);
    expect(properties).toEqual({
      $current_url: "https://veltrio.autos/search?type=suv",
      $referrer: "https://veltrio.autos/search",
      count: 3,
    });
    expect(() => scrubSearchPlace(undefined)).not.toThrow();
  });
});
