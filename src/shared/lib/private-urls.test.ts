import { describe, expect, it } from "vitest";
import {
  scrubPrivate,
  withoutLinkToken,
  withoutSearchPlace,
} from "./private-urls";

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

describe("withoutLinkToken", () => {
  const host = "https://movup.veltrio.autos";

  it("hides the secret of every renter link and keeps what names the booking", () => {
    expect(withoutLinkToken(`${host}/pay/s3cr3t`)).toBe(`${host}/pay/[token]`);
    expect(withoutLinkToken(`${host}/es/pay/s3cr3t?paid=1#top`)).toBe(
      `${host}/es/pay/[token]?paid=1#top`,
    );
    expect(withoutLinkToken(`${host}/sign/c-42/s3cr3t`)).toBe(
      `${host}/sign/c-42/[token]`,
    );
    expect(withoutLinkToken(`${host}/receipt/b-7/s3cr3t`)).toBe(
      `${host}/receipt/b-7/[token]`,
    );
    expect(withoutLinkToken("/en/s/movup/bookings/BK-10007/s3cr3t")).toBe(
      "/en/s/movup/bookings/BK-10007/[token]",
    );
    // Inside a sentence, as an error message carries it.
    expect(withoutLinkToken("GET /pay/s3cr3t failed, then /sign/c/t0k")).toBe(
      "GET /pay/[token] failed, then /sign/c/[token]",
    );
  });

  it("leaves other addresses alone", () => {
    for (const text of [
      `${host}/vehicles/bmw-m4`,
      `${host}/vehicles/bmw-m4/book?pickup=2026-10-10`,
      "/sign/c-42",
      "/pay",
      "",
    ]) {
      expect(withoutLinkToken(text)).toBe(text);
    }
  });
});

describe("scrubPrivate", () => {
  it("cleans every text field, however deep, and ignores the rest", () => {
    const event = {
      $current_url: "https://veltrio.autos/search?near=1%2C2&type=suv",
      count: 3,
      request: { url: "https://movup.veltrio.autos/pay/s3cr3t", headers: null },
      breadcrumbs: [{ data: { to: "/sign/c-42/s3cr3t" } }],
    };
    expect(scrubPrivate(event)).toEqual({
      $current_url: "https://veltrio.autos/search?type=suv",
      count: 3,
      request: {
        url: "https://movup.veltrio.autos/pay/[token]",
        headers: null,
      },
      breadcrumbs: [{ data: { to: "/sign/c-42/[token]" } }],
    });
  });

  it("copes with nothing to clean and with an event that holds itself", () => {
    expect(scrubPrivate(undefined)).toBeUndefined();
    const loop: Record<string, unknown> = { url: "/pay/s3cr3t" };
    loop.self = loop;
    expect(scrubPrivate(loop).url).toBe("/pay/[token]");
  });
});
