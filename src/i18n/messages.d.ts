import type booking from "../../messages/en/booking.json";
import type common from "../../messages/en/common.json";
import type companies from "../../messages/en/companies.json";
import type company from "../../messages/en/company.json";
import type contract from "../../messages/en/contract.json";
import type landing from "../../messages/en/landing.json";
import type payment from "../../messages/en/payment.json";
import type search from "../../messages/en/search.json";
import type vehicle from "../../messages/en/vehicle.json";
import type { routing } from "./routing";

// Checks message keys and locales at compile time; English is the reference.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      booking: typeof booking;
      common: typeof common;
      companies: typeof companies;
      company: typeof company;
      contract: typeof contract;
      landing: typeof landing;
      payment: typeof payment;
      search: typeof search;
      vehicle: typeof vehicle;
    };
  }
}
