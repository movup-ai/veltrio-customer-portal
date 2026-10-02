import { describe, expect, it } from "vitest";
import type { VehiclePhoto } from "./types";
import { groupPhotos } from "./vehicle.utils";

const photo = (id: string, label: string | null): VehiclePhoto => ({
  id,
  name: `${id}.jpg`,
  label,
  variants: [],
});

describe("groupPhotos", () => {
  it("groups by label in first-seen order and keeps each photo's position", () => {
    const groups = groupPhotos([
      photo("a", "Front"),
      photo("b", "Interior"),
      photo("c", "Front"),
    ]);
    expect(groups.map((group) => group.label)).toEqual(["Front", "Interior"]);
    expect(groups[0]?.photos.map((entry) => entry.index)).toEqual([0, 2]);
  });

  it("puts unlabelled photos in a single group", () => {
    const groups = groupPhotos([photo("a", null), photo("b", null)]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("All photos");
  });
});
