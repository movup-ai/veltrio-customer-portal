import { describe, expect, it } from "vitest";
import { localizeHref } from "./href";

describe("localizeHref", () => {
  it("leaves every address alone in English", () => {
    for (const href of ["/", "/search?type=suv", "http://localhost:3000/x"]) {
      expect(localizeHref(href, "en")).toBe(href);
    }
  });

  it("prefixes paths, keeping the query and fragment", () => {
    expect(localizeHref("/", "es")).toBe("/es");
    expect(localizeHref("/search?type=suv", "es")).toBe("/es/search?type=suv");
    expect(localizeHref("/#cities", "es")).toBe("/es#cities");
    expect(localizeHref("/how-it-works#faq", "es")).toBe(
      "/es/how-it-works#faq",
    );
  });

  it("prefixes the marketplace's and a company's full addresses", () => {
    expect(localizeHref("http://localhost:3000/", "es")).toBe(
      "http://localhost:3000/es",
    );
    expect(
      localizeHref(
        "http://movup.localhost:3000/vehicles/bmw-m4?pickup=1",
        "es",
      ),
    ).toBe("http://movup.localhost:3000/es/vehicles/bmw-m4?pickup=1");
  });

  it("leaves addresses that are not our pages", () => {
    for (const href of [
      "#pricing",
      "mailto:help@example.com",
      "https://app.example.com/sign-up",
      "http://localhost:8000/api/v1/receipt.pdf",
    ]) {
      expect(localizeHref(href, "es")).toBe(href);
    }
  });
});
