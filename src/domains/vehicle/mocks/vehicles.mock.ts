import type {
  FuelType,
  Transmission,
  Vehicle,
  VehiclePhoto,
  VehicleType,
} from "../types";

/**
 * Placeholder data in the API's shape. Remove once a public marketplace
 * endpoint exists (see vehicle.repository.ts).
 */

const SIZES = [
  { size: "thumbnail", width: 400, height: 300 },
  { size: "medium", width: 800, height: 600 },
  { size: "large", width: 1600, height: 1200 },
] as const;

function photo(unsplashId: string, name: string): VehiclePhoto {
  return {
    id: unsplashId,
    name,
    variants: SIZES.map((s) => ({
      ...s,
      url: `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&q=75&w=${s.width}&h=${s.height}`,
    })),
  };
}

interface Seed {
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  location: string;
  photoId: string;
  dailyRate: number;
  includedMiles: number;
  transmission?: Transmission;
  fuelType?: FuelType;
  seats: number;
  horsepower: number;
  zeroToSixtySec: number;
  company: Vehicle["company"];
}

const apex = { name: "Apex Motor Club", subdomain: "apex-motor-club" };
const coastline = { name: "Coastline Exotics", subdomain: "coastline-exotics" };
const voltaire = { name: "Voltaire EV Co.", subdomain: "voltaire-ev" };
const northbound = {
  name: "Northbound Rentals",
  subdomain: "northbound-rentals",
};

const seeds: Seed[] = [
  {
    make: "Mercedes-AMG",
    model: "GT R",
    year: 2022,
    vehicleType: "sport",
    color: "Green Hell Magno",
    location: "Brickell",
    photoId: "1618843479313-40f8afb4b4d8",
    dailyRate: 319,
    includedMiles: 150,
    seats: 2,
    horsepower: 577,
    zeroToSixtySec: 3.5,
    company: coastline,
  },
  {
    make: "Porsche",
    model: "911 GT3",
    year: 2023,
    vehicleType: "sport",
    color: "Crayon",
    location: "Miami Beach",
    photoId: "1614162692292-7ac56d7f7f1e",
    dailyRate: 429,
    includedMiles: 200,
    seats: 2,
    horsepower: 502,
    zeroToSixtySec: 3.2,
    company: apex,
  },
  {
    make: "Audi",
    model: "R8 V10 Performance",
    year: 2022,
    vehicleType: "coupe",
    color: "Kemora Grey",
    location: "Brickell",
    photoId: "1603584173870-7f23fdae1b7a",
    dailyRate: 399,
    includedMiles: 150,
    seats: 2,
    horsepower: 602,
    zeroToSixtySec: 3.1,
    company: coastline,
  },
  {
    make: "BMW",
    model: "M5 Competition",
    year: 2023,
    vehicleType: "sedan",
    color: "Brooklyn Grey",
    location: "Miami Beach",
    photoId: "1555215695-3004980ad54e",
    dailyRate: 259,
    includedMiles: 250,
    seats: 5,
    horsepower: 617,
    zeroToSixtySec: 3.1,
    company: apex,
  },
  {
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2024,
    vehicleType: "sedan",
    color: "Pearl White",
    location: "Coral Gables",
    photoId: "1560958089-b8a1929cea89",
    dailyRate: 89,
    includedMiles: 300,
    fuelType: "electric",
    seats: 5,
    horsepower: 394,
    zeroToSixtySec: 4.2,
    company: voltaire,
  },
  {
    make: "Ford",
    model: "Mustang GT",
    year: 2023,
    vehicleType: "coupe",
    color: "Shadow Black",
    location: "Miami Beach",
    photoId: "1494976388531-d1058494cdd8",
    dailyRate: 139,
    includedMiles: 200,
    transmission: "manual",
    seats: 4,
    horsepower: 480,
    zeroToSixtySec: 4.2,
    company: apex,
  },
  {
    make: "Ford",
    model: "Expedition Platinum",
    year: 2023,
    vehicleType: "suv",
    color: "Star White",
    location: "Doral",
    photoId: "1533473359331-0135ef1b58bf",
    dailyRate: 159,
    includedMiles: 300,
    seats: 8,
    horsepower: 440,
    zeroToSixtySec: 5.8,
    company: northbound,
  },
  {
    make: "Honda",
    model: "CR-V Hybrid",
    year: 2024,
    vehicleType: "crossover",
    color: "Platinum White",
    location: "Doral",
    photoId: "1519641471654-76ce0107ad1b",
    dailyRate: 69,
    includedMiles: 300,
    fuelType: "hybrid",
    seats: 5,
    horsepower: 204,
    zeroToSixtySec: 7.6,
    company: northbound,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const MOCK_VEHICLES: Vehicle[] = seeds.map((seed, index) => {
  const id = `mock-${index + 1}`;
  return {
    id,
    uri: `${slugify(`${seed.make} ${seed.model}`)}-${id}`,
    make: seed.make,
    model: seed.model,
    year: seed.year,
    vehicleType: seed.vehicleType,
    color: seed.color,
    location: seed.location,
    description: null,
    photos: [photo(seed.photoId, `${seed.make} ${seed.model}`)],
    rateOptions: [
      {
        id: `${id}-day`,
        label: "Daily",
        basis: "day",
        rateCents: seed.dailyRate * 100,
        includedMiles: seed.includedMiles,
        unlimitedMileage: false,
      },
    ],
    specs: {
      transmission: seed.transmission ?? "automatic",
      fuelType: seed.fuelType ?? "petrol",
      seats: seed.seats,
      doors: seed.seats > 2 ? 4 : 2,
      topSpeedMph: null,
      horsepower: seed.horsepower,
      zeroToSixtySec: seed.zeroToSixtySec,
      cylinders: null,
    },
    company: seed.company,
  };
});
