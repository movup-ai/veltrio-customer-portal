import { beforeEach, describe, expect, it } from "vitest";
import { loadRecentSearch, saveRecentSearch } from "./recent-search";

const search = {
  location: "miami",
  pickup: "2026-10-09",
  pickupTime: "10:00",
  return: "2026-10-12",
  returnTime: "11:00",
};

describe("recent search", () => {
  beforeEach(() => localStorage.clear());

  it("gives back the last search", () => {
    saveRecentSearch({ location: "las-vegas" });
    saveRecentSearch(search);
    expect(loadRecentSearch("2026-10-08")).toMatchObject(search);
  });

  it("forgets the dates once the pick-up day has passed, keeping the rest", () => {
    saveRecentSearch(search);
    expect(loadRecentSearch("2026-10-09")?.pickup).toBe("2026-10-09");
    const stale = loadRecentSearch("2026-10-10");
    expect(stale?.location).toBe("miami");
    expect(stale?.pickup).toBeUndefined();
    expect(stale?.return).toBeUndefined();
  });

  it("is null when nothing was searched or the stored text is not a search", () => {
    expect(loadRecentSearch("2026-10-08")).toBeNull();
    localStorage.setItem("veltrio:recent-search", "not json");
    expect(loadRecentSearch("2026-10-08")).toBeNull();
  });
});
