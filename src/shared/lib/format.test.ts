import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats cents as whole dollars", () => {
    expect(formatMoney(31900)).toBe("$319");
    expect(formatMoney(490000)).toBe("$4,900");
  });

  it("keeps the cents when there are some", () => {
    expect(formatMoney(32475)).toBe("$324.75");
    expect(formatMoney(1667)).toBe("$16.67");
  });
});
