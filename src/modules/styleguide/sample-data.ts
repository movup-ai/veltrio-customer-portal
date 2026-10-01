import type { Company } from "@/modules/company/types";
import { collections } from "@/modules/marketing/landing.content";
import type { Vehicle, VehiclePhoto } from "@/modules/vehicle/types";

/** Sample content for the /design page only. Never shown to renters. */

const PHOTOS: VehiclePhoto[] = collections.map(({ image }, index) => ({
  id: `sample-photo-${index}`,
  name: "sample.jpg",
  variants: image.variants.map((variant, i) => ({
    ...variant,
    size: i === 0 ? "medium" : "large",
  })),
}));

const base = {
  color: "Silver",
  location: "Miami Beach",
  description: null,
  company: { name: "Coastline Exotics", subdomain: "coastline-exotics" },
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
    photos: PHOTOS.slice(0, 1),
    rateOptions: [
      {
        id: "r1",
        label: "Daily",
        basis: "day",
        rateCents: 129500,
        includedMiles: 100,
        unlimitedMileage: false,
      },
    ],
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
    company: null,
    photos: PHOTOS.slice(1, 2),
    rateOptions: [
      {
        id: "r2",
        label: "Daily",
        basis: "day",
        rateCents: 14900,
        includedMiles: null,
        unlimitedMileage: true,
      },
    ],
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
    rateOptions: [],
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

export const SAMPLE_COMPANIES: Company[] = [
  {
    id: "sample-c1",
    name: "Coastline Exotics",
    subdomain: "coastline-exotics",
    city: "Miami Beach",
    vehicleCount: 28,
  },
  {
    id: "sample-c2",
    name: "Northbound Rentals",
    subdomain: "northbound-rentals",
    city: "Scottsdale",
    vehicleCount: 55,
  },
  {
    id: "sample-c3",
    name: "Apex Motor Club",
    subdomain: "apex-motor-club",
    city: "Las Vegas",
    vehicleCount: 42,
  },
  {
    id: "sample-c4",
    name: "Voltaire EV Co.",
    subdomain: "voltaire-ev",
    city: "Los Angeles",
    vehicleCount: 64,
  },
];
