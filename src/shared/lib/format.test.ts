import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats cents as whole dollars", () => {
    expect(formatMoney(31900)).toBe("$319");
    expect(formatMoney(490000)).toBe("$4,900");
  });
});
