import { describe, expect, it } from "vitest";
import type { CompanyLocation } from "@/modules/company/types";
import type { Vehicle } from "@/modules/vehicle/types";
import { branchLabel, groupByBranch } from "./branches";

const vehicle = (
  id: string,
  subdomain: string,
  location: string,
  dailyRateCents: number | null,
) =>
  ({
    id,
    location,
    dailyRateCents,
    company: { subdomain, name: subdomain.toUpperCase() },
  }) as Vehicle;

const place = (name: string, latitude: number | null) =>
  ({
    name,
    address: `${name} St`,
    latitude,
    longitude: latitude,
  }) as CompanyLocation;

const vehicles = [
  vehicle("a", "abc", "Downtown", 9000),
  vehicle("b", "abc", "Downtown", 7000),
  vehicle("c", "abc", "Airport", null),
  vehicle("d", "xyz", "Downtown", 5000),
  vehicle("e", "xyz", "Unmapped", 4000),
  vehicle("f", "gone", "Downtown", 3000),
];
const locations = {
  abc: [place("Downtown", 1), place("Airport", 2)],
  xyz: [place("Downtown", 3), place("Unmapped", null)],
};

describe("groupByBranch", () => {
  it("makes one pin per branch with coordinates, keeping companies apart", () => {
    expect(
      groupByBranch(vehicles, locations).map((branch) => [
        branch.key,
        branch.latitude,
        branch.vehicleIds,
        branch.fromCents,
      ]),
    ).toEqual([
      ["abc/Downtown", 1, ["a", "b"], 7000],
      ["abc/Airport", 2, ["c"], null],
      ["xyz/Downtown", 3, ["d"], 5000],
    ]);
  });
});

describe("branchLabel", () => {
  const [downtown, airport, other] = groupByBranch(vehicles, locations);

  it("shows the lowest rate, with the count when there are several cars", () => {
    expect(branchLabel(downtown!)).toBe("from $70 · 2");
    expect(branchLabel(other!)).toBe("$50");
    expect(branchLabel(airport!)).toBe("1 car");
  });

  it("shows the pointed vehicle's own rate on its branch only", () => {
    expect(branchLabel(downtown!, vehicles[0])).toBe("$90");
    expect(branchLabel(other!, vehicles[0])).toBe("$50");
  });
});
