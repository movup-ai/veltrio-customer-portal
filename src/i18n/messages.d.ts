import type common from "../../messages/en/common.json";
import type { routing } from "./routing";

// Checks message keys and locales at compile time; English is the reference.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: { common: typeof common };
  }
}
