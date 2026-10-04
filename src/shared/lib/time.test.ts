import { describe, expect, it } from "vitest";
import { formatTime, HOURLY_TIMES, minutesToTime, parseTime } from "./time";

describe("formatTime", () => {
  it("formats 24-hour values on a 12-hour clock", () => {
    expect(formatTime("07:00")).toBe("7:00 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("14:30")).toBe("2:30 PM");
    expect(formatTime("00:05")).toBe("12:05 AM");
  });
});

describe("parseTime", () => {
  it("accepts HH:mm and rejects anything else", () => {
    expect(parseTime("10:00")).toBe("10:00");
    expect(parseTime("25:00")).toBeUndefined();
    expect(parseTime("10am")).toBeUndefined();
    expect(parseTime(null)).toBeUndefined();
  });
});

describe("HOURLY_TIMES", () => {
  it("runs from 7 AM to 8 PM", () => {
    expect(HOURLY_TIMES[0]).toBe("07:00");
    expect(HOURLY_TIMES.at(-1)).toBe("20:00");
  });
});

describe("minutesToTime", () => {
  it("converts minutes from midnight", () => {
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(1110)).toBe("18:30");
    expect(minutesToTime(1440)).toBe("00:00");
  });
});
