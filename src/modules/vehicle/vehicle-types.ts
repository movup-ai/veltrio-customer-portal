import {
  Bus,
  Car,
  CarFront,
  CarTaxiFront,
  Gauge,
  Mountain,
  Sun,
  Truck,
  Van,
  type LucideIcon,
} from "lucide-react";
import type { FuelType, Transmission, VehicleType } from "./types";

interface VehicleTypeMeta {
  label: string;
  icon: LucideIcon;
}

/** Display metadata for each API vehicle type. */
export const VEHICLE_TYPE_META: Record<VehicleType, VehicleTypeMeta> = {
  sport: { label: "Sport", icon: Gauge },
  convertible: { label: "Convertible", icon: Sun },
  coupe: { label: "Coupé", icon: CarFront },
  sedan: { label: "Sedan", icon: Car },
  suv: { label: "SUV", icon: Mountain },
  crossover: { label: "Crossover", icon: CarTaxiFront },
  hatchback: { label: "Hatchback", icon: Car },
  wagon: { label: "Wagon", icon: CarFront },
  pickup_truck: { label: "Pickup", icon: Truck },
  minivan: { label: "Minivan", icon: Bus },
  van: { label: "Van", icon: Van },
};

export const TRANSMISSION_LABEL: Record<Transmission, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

export const FUEL_LABEL: Record<FuelType, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
};

export const VEHICLE_TYPE_ORDER = Object.keys(
  VEHICLE_TYPE_META,
) as VehicleType[];
