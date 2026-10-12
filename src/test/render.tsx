import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { english } from "./messages";

/** Renders a component as a page would: inside the language provider, in English. */
export function renderInEnglish(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={english}>
      {ui}
    </NextIntlClientProvider>,
  );
}
