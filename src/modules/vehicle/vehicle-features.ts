import {
  Bluetooth,
  Camera,
  Navigation,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sun,
  Usb,
  type LucideIcon,
} from "lucide-react";
import type { VehicleFeature } from "./types";

/** Display metadata for each API vehicle feature. */
export const VEHICLE_FEATURE_META: Record<
  VehicleFeature,
  { label: string; icon: LucideIcon }
> = {
  air_conditioning: { label: "Air conditioning", icon: Snowflake },
  gps_navigation: { label: "GPS navigation", icon: Navigation },
  bluetooth_audio: { label: "Bluetooth audio", icon: Bluetooth },
  usb_charging: { label: "USB charging", icon: Usb },
  sunroof: { label: "Sunroof", icon: Sun },
  driver_assist: { label: "Driver assist", icon: ShieldCheck },
  apple_car_play: { label: "Apple CarPlay", icon: Smartphone },
  rear_view_camera: { label: "Rear-view camera", icon: Camera },
};
