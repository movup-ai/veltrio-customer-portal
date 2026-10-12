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

/** The icon of each API vehicle feature; its name is in the vehicle messages. */
export const VEHICLE_FEATURE_META: Record<
  VehicleFeature,
  { icon: LucideIcon }
> = {
  air_conditioning: { icon: Snowflake },
  gps_navigation: { icon: Navigation },
  bluetooth_audio: { icon: Bluetooth },
  usb_charging: { icon: Usb },
  sunroof: { icon: Sun },
  driver_assist: { icon: ShieldCheck },
  apple_car_play: { icon: Smartphone },
  rear_view_camera: { icon: Camera },
};
