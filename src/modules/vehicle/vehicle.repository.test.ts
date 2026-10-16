import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGetAll } from "@/shared/api/client";
import { findListedVehicles } from "./vehicle.repository";

vi.mock("@/shared/api/client", () => ({
  ApiError: class extends Error {},
  apiGet: vi.fn(),
  apiGetAll: vi.fn(async () => []),
}));

/** The query the API was asked, as a plain object. */
const asked = () =>
  Object.fromEntries(
    new URL(vi.mocked(apiGetAll).mock.calls[0]![0], "http://api").searchParams,
  );

beforeEach(() => vi.mocked(apiGetAll).mockClear());

describe("findListedVehicles", () => {
  it("asks for a city with no state as an empty state, so namesakes elsewhere stay out", async () => {
    await findListedVehicles({ city: "Springfield", state: null });
    expect(asked()).toEqual({ city: "Springfield", state: "" });
  });

  it("sends a city's state as it is", async () => {
    await findListedVehicles({ city: "Springfield", state: "IL" });
    expect(asked()).toEqual({ city: "Springfield", state: "IL" });
  });

  it("leaves the state out when no city is asked for", async () => {
    await findListedVehicles({ state: null });
    expect(asked()).toEqual({});
  });

  it("treats a blank city as none, so it does not become a search by missing state", async () => {
    await findListedVehicles({ city: "   ", state: null });
    expect(asked()).toEqual({});
  });
});
