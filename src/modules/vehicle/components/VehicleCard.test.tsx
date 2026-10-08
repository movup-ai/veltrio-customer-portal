import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";

const vehicle = {
  id: "v1",
  uri: "bmw-m4-2024",
  make: "BMW",
  model: "M4",
  year: 2024,
  color: "Grey",
  location: "Miami",
  photos: [],
  dailyRateCents: 25000,
  specs: { fuelType: "petrol", seats: 4 },
  company: { name: "Coastline", subdomain: "coastline" },
} as unknown as Vehicle;

afterEach(cleanup);

describe("VehicleCard", () => {
  it("opens the vehicle in the same tab by default", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByRole("link").getAttribute("target")).toBeNull();
  });

  it("opens the vehicle in a new tab when asked, and says so", () => {
    render(<VehicleCard vehicle={vehicle} newTab />);
    const link = screen.getByRole("link", {
      name: /opens in a new tab/,
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener");
  });
});
