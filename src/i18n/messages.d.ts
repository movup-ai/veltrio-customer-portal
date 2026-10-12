import type common from "../../messages/en/common.json";
import type companies from "../../messages/en/companies.json";
import type landing from "../../messages/en/landing.json";
import type search from "../../messages/en/search.json";
import type vehicle from "../../messages/en/vehicle.json";
import type { routing } from "./routing";

// Checks message keys and locales at compile time; English is the reference.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      common: typeof common;
      companies: typeof companies;
      landing: typeof landing;
      search: typeof search;
      vehicle: typeof vehicle;
    };
  }
}
