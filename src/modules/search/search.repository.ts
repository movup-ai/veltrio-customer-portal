import { cache } from "react";
import { apiGet } from "@/shared/api/client";
import type { City } from "./cities";

/** Every city with a vehicle to rent, the fullest first. */
export const listCities = cache(async (): Promise<City[]> => {
  const cities = await apiGet<City[]>("/marketplace/cities");
  return cities.map(({ city, state, latitude, longitude, vehicleCount }) => ({
    city,
    state,
    latitude,
    longitude,
    vehicleCount,
  }));
});
