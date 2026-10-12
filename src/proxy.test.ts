// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

const SITE = "http://localhost:3000";
const COMPANY = "http://movup.localhost:3000";

/** Where a request ends up: the internal path it is served from, or where it is sent instead. */
function route(url: string, headers: Record<string, string> = {}) {
  const { host } = new URL(url);
  const response = proxy(
    new NextRequest(url, { headers: { host, ...headers } }),
  );
  const rewrite = response.headers.get("x-middleware-rewrite");
  const location = response.headers.get("location");
  if (location) return { redirect: location };
  const served = rewrite ? new URL(rewrite) : new URL(url);
  return { serves: served.pathname + served.search };
}

describe("proxy", () => {
  it("serves the marketplace in English without a prefix, and Spanish under /es", () => {
    expect(route(`${SITE}/search?type=suv`)).toEqual({
      serves: "/en/search?type=suv",
    });
    expect(route(`${SITE}/es/search?type=suv`)).toEqual({
      serves: "/es/search?type=suv",
    });
    expect(route(`${SITE}/`)).toEqual({ serves: "/en" });
  });

  it("drops the prefix English does not need", () => {
    expect(route(`${SITE}/en/search`)).toEqual({ redirect: `${SITE}/search` });
  });

  it("serves a company subdomain from its internal tree, in either language", () => {
    expect(route(`${COMPANY}/vehicles/bmw-m4?pickup=2026-10-10`)).toEqual({
      serves: "/en/s/movup/vehicles/bmw-m4?pickup=2026-10-10",
    });
    expect(route(`${COMPANY}/es/vehicles/bmw-m4`)).toEqual({
      serves: "/es/s/movup/vehicles/bmw-m4",
    });
    expect(route(`${COMPANY}/`)).toEqual({ serves: "/en/s/movup" });
    expect(route(`${COMPANY}/es`)).toEqual({ serves: "/es/s/movup" });
  });

  it("sends a Spanish browser to the Spanish address, never to the internal one", () => {
    const spanish = { "accept-language": "es-MX,es;q=0.9" };
    expect(route(`${SITE}/search`, spanish)).toEqual({
      redirect: `${SITE}/es/search`,
    });
    expect(route(`${COMPANY}/vehicles/bmw-m4`, spanish)).toEqual({
      redirect: `${COMPANY}/es/vehicles/bmw-m4`,
    });
    expect(route(`${COMPANY}/`, spanish)).toEqual({
      redirect: `${COMPANY}/es`,
    });
  });

  it("keeps the internal tree unreachable by its own path", () => {
    expect(route(`${SITE}/s/movup`)).toEqual({ serves: "/en/404" });
    expect(route(`${SITE}/es/s/movup/vehicles/x`)).toEqual({
      serves: "/es/404",
    });
  });

  it("sends marketplace pages asked of a company back to the marketplace", () => {
    expect(route(`${COMPANY}/es/search?type=suv`)).toEqual({
      redirect: `${SITE}/es/search?type=suv`,
    });
  });
});
