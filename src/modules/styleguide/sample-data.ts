import type { Company } from "@/modules/company/types";
import { collections } from "@/modules/marketing/landing.content";
import type { City } from "@/modules/search/cities";
import type { Vehicle, VehiclePhoto } from "@/modules/vehicle/types";

/** Sample content for the /design page only. Never shown to renters. */

const PHOTOS: VehiclePhoto[] = collections.map(({ image }, index) => ({
  id: `sample-photo-${index}`,
  name: "sample.jpg",
  label: null,
  variants: image.variants.map((variant, i) => ({
    ...variant,
    size: i === 0 ? "medium" : "large",
  })),
}));

const base = {
  color: "Silver",
  location: "Miami Beach",
  description: null,
  features: [],
  company: {
    id: "sample-c1",
    name: "Coastline Exotics",
    subdomain: "coastline-exotics",
    timeZone: "America/New_York",
  },
};

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    ...base,
    id: "sample-1",
    uri: "lamborghini-huracan-evo-sample",
    make: "Lamborghini",
    model: "Huracán EVO",
    year: 2024,
    vehicleType: "sport",
    color: "Yellow",
    photos: PHOTOS,
    dailyRateCents: 129500,
    specs: {
      transmission: "automatic",
      fuelType: "petrol",
      seats: 2,
      doors: 2,
      topSpeedMph: 202,
      horsepower: 631,
      zeroToSixtySec: 2.9,
      cylinders: 10,
    },
  },
  {
    ...base,
    id: "sample-2",
    uri: "ford-expedition-sample",
    make: "Ford",
    model: "Expedition",
    year: 2025,
    vehicleType: "suv",
    color: "White",
    location: "Scottsdale",
    photos: PHOTOS.slice(1, 2),
    dailyRateCents: 14900,
    specs: {
      transmission: "automatic",
      fuelType: "electric",
      seats: 7,
      doors: 4,
      topSpeedMph: null,
      horsepower: null,
      zeroToSixtySec: null,
      cylinders: null,
    },
  },
  {
    ...base,
    id: "sample-3",
    uri: "mercedes-amg-gt-sample",
    make: "Mercedes-AMG",
    model: "GT",
    year: 2023,
    vehicleType: "convertible",
    photos: PHOTOS.slice(2, 3),
    dailyRateCents: null,
    specs: {
      transmission: "automatic",
      fuelType: "petrol",
      seats: 2,
      doors: 2,
      topSpeedMph: 193,
      horsepower: 523,
      zeroToSixtySec: 3.7,
      cylinders: 8,
    },
  },
];

export const SAMPLE_CITIES: City[] = [
  {
    city: "Miami",
    state: "FL",
    latitude: null,
    longitude: null,
    vehicleCount: 12,
  },
  {
    city: "Los Angeles",
    state: "CA",
    latitude: null,
    longitude: null,
    vehicleCount: 7,
  },
];

export const SAMPLE_COMPANIES: Company[] = [
  {
    id: "sample-c1",
    name: "Coastline Exotics",
    subdomain: "coastline-exotics",
    website: null,
    country: "US",
    logoUrl: null,
    vehicleCount: 28,
  },
  {
    id: "sample-c2",
    name: "Northbound Rentals",
    subdomain: "northbound-rentals",
    website: null,
    country: "US",
    logoUrl: null,
    vehicleCount: 55,
  },
  {
    id: "sample-c3",
    name: "Apex Motor Club",
    subdomain: "apex-motor-club",
    website: null,
    country: "US",
    logoUrl: null,
    vehicleCount: 42,
  },
  {
    id: "sample-c4",
    name: "Voltaire EV Co.",
    subdomain: "voltaire-ev",
    website: null,
    country: "US",
    logoUrl: null,
    vehicleCount: 64,
  },
];
