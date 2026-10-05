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
  const { values, errors, set, touch } = form;
  const rental = quote ? formatMoney(quote.totalCents) : "the rental";
  const deposit = quote
    ? `${formatMoney(quote.depositCents)} deposit`
    : "security deposit";

  const timings: RadioCardOption<PaymentTiming>[] = [
    {
      value: "rental_first",
      title: "Rental now, deposit at pick-up",
      description: `Pay ${rental} online. The ${deposit} is secured on your card when you collect the car.`,
    },
    {
      value: "all_at_once",
      title: "Rental and deposit together",
      description: `Pay ${rental} and secure the ${deposit} in one online payment. Nothing left to do at pick-up.`,
    },
  ];

  const methods: RadioCardOption<PaymentMethod>[] = [
    {
      value: "online",
      title: "Pay online",
      description: `${companyName} emails you a secure payment link once they accept your request.`,
      detail: (
        <div data-field="paymentTiming">
          <RadioCardGroup
            nested
            legend="When should the deposit be secured?"
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
      title: "Pay in cash",
      description: `Pay ${rental} when you collect the car. ${companyName} will tell you how the deposit is taken.`,
    },
  ];

  return (
    <BookingSection
      title="Payment preference"
      description="You are not charged when you send this request."
    >
      <div data-field="paymentMethod">
        <RadioCardGroup
          legend="How would you like to pay?"
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
