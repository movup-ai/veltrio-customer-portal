import { describe, expect, it } from "vitest";
import { subdomainFromHost } from "./tenant";

describe("subdomainFromHost", () => {
  it("reads the company subdomain", () => {
    expect(subdomainFromHost("abc-rental.veltrio.autos", "veltrio.autos")).toBe(
      "abc-rental",
    );
    expect(subdomainFromHost("movup.localhost:3000", "localhost:3000")).toBe(
      "movup",
    );
  });

  it("returns null for the marketplace host, www and unrelated hosts", () => {
    expect(subdomainFromHost("veltrio.autos", "veltrio.autos")).toBeNull();
    expect(subdomainFromHost("www.veltrio.autos", "veltrio.autos")).toBeNull();
    expect(subdomainFromHost("a.b.veltrio.autos", "veltrio.autos")).toBeNull();
    expect(subdomainFromHost("evil.example.com", "veltrio.autos")).toBeNull();
    expect(subdomainFromHost(null, "veltrio.autos")).toBeNull();
  });
});
