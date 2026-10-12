import { useTranslations } from "next-intl";
import { formatMoney } from "@/shared/lib/format";
import {
  RadioCardGroup,
  type RadioCardOption,
} from "@/shared/ui/molecules/RadioCardGroup";
import type { BookingFormApi } from "../booking.form";
import type { BookingQuote, PaymentMethod, PaymentTiming } from "../types";
import { BookingSection } from "./BookingSection";

interface BookingPaymentSectionProps {
  form: BookingFormApi;
  companyName: string;
  /** Null when the company has not priced the rental yet. */
  quote: BookingQuote | null;
}

/** How the renter prefers to pay and, for online payment, when the deposit is taken. */
export function BookingPaymentSection({
  form,
  companyName,
  quote,
}: BookingPaymentSectionProps) {
  const t = useTranslations("booking.payment");
  const { values, errors, set, touch } = form;
  const rental = quote ? formatMoney(quote.totalCents) : t("theRental");
  const deposit =
    quote?.depositCents != null
      ? t("depositOf", { amount: formatMoney(quote.depositCents) })
      : t("securityDeposit");

  const timings: RadioCardOption<PaymentTiming>[] = [
    {
      value: "rental_first",
      title: t("rentalFirst.title"),
      description: t("rentalFirst.description", { rental, deposit }),
    },
    {
      value: "all_at_once",
      title: t("allAtOnce.title"),
      description: t("allAtOnce.description", { rental, deposit }),
    },
  ];

  const methods: RadioCardOption<PaymentMethod>[] = [
    {
      value: "online",
      title: t("online.title"),
      description: t("online.description", { company: companyName }),
      detail: (
        <div data-field="paymentTiming">
          <RadioCardGroup
            nested
            legend={t("timingLegend")}
            options={timings}
            value={values.paymentTiming}
            onChange={(timing) => {
              set("paymentTiming", timing);
              touch("paymentTiming");
            }}
            error={errors.paymentTiming}
          />
        </div>
      ),
    },
    {
      value: "cash",
      title: t("cash.title"),
      description: t("cash.description", { rental, company: companyName }),
    },
  ];

  return (
    <BookingSection title={t("title")} description={t("description")}>
      <div data-field="paymentMethod">
        <RadioCardGroup
          legend={t("legend")}
          options={methods}
          value={values.paymentMethod}
          onChange={(method) => {
            set("paymentMethod", method);
            touch("paymentMethod");
          }}
          error={errors.paymentMethod}
        />
      </div>
    </BookingSection>
  );
}
