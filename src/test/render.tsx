import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import common from "../../messages/en/common.json";
import company from "../../messages/en/company.json";
import vehicle from "../../messages/en/vehicle.json";

/** Renders a component as a page would: inside the language provider, in English. */
export function renderInEnglish(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ common, company, vehicle }}>
      {ui}
    </NextIntlClientProvider>,
  );
}
