import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { CompanyLocation } from "../types";
import { CompanyLocations } from "./CompanyLocations";

const base: CompanyLocation = {
  id: "l1",
  name: "Main Office",
  address: "1601 Collins Ave, Miami Beach",
  latitude: 25.79,
  longitude: -80.13,
  isDefault: true,
  openingDays: "mon_sat",
  opensAt: 540,
  closesAt: 1110,
  vehicleCount: 4,
};
const airport: CompanyLocation = {
  ...base,
  id: "l2",
  name: "Airport",
  address: "3900 NW 25th St, Miami",
  latitude: null,
  longitude: null,
  isDefault: false,
  openingDays: "mon_sun",
  vehicleCount: 1,
};

afterEach(cleanup);

describe("CompanyLocations", () => {
  it("shows each branch with its hours, vehicle count and main-branch mark", () => {
    render(<CompanyLocations locations={[base, airport]} />);
    expect(screen.getByText("Mon–Sat, 9:00 AM – 6:30 PM")).toBeTruthy();
    expect(screen.getByText("Every day, 9:00 AM – 6:30 PM")).toBeTruthy();
    expect(screen.getByText("4 vehicles here")).toBeTruthy();
    expect(screen.getByText("1 vehicle here")).toBeTruthy();
    expect(screen.getAllByText("Main branch")).toHaveLength(1);
  });

  it("moves the map to the chosen branch, by address when it has no coordinates", () => {
    render(<CompanyLocations locations={[base, airport]} />);
    const map = () => screen.getByTitle(/^Map of/) as HTMLIFrameElement;
    expect(map().src).toContain(encodeURIComponent("25.79,-80.13"));

    fireEvent.click(screen.getByRole("button", { name: /Airport/ }));
    expect(map().title).toBe("Map of Airport");
    expect(map().src).toContain(encodeURIComponent("3900 NW 25th St, Miami"));
  });

  it("says so when a branch has neither coordinates nor an address", () => {
    render(<CompanyLocations locations={[{ ...airport, address: "" }]} />);
    expect(
      screen.getByText("Airport has no address on file yet."),
    ).toBeTruthy();
  });
});
