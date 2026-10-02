import { describe, expect, it } from "vitest";
import { isHexColor, readableOn } from "./color";

describe("readableOn", () => {
  it("picks white text on dark colours and dark text on light ones", () => {
    expect(readableOn("#0f4c5c")).toBe("#ffffff");
    expect(readableOn("#ffd166")).toBe("#0f1012");
  });

  it("falls back to light text for something that is not a hex colour", () => {
    expect(readableOn("teal")).toBe("#ffffff");
  });
});

describe("isHexColor", () => {
  it("accepts only six-digit hex", () => {
    expect(isHexColor("#0f4c5c")).toBe(true);
    expect(isHexColor("red; background: url(x)")).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });
});
