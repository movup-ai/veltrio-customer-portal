import { useState } from "react";
import {
  EMPTY_BOOKING_FORM,
  validateBooking,
  type BookingErrors,
  type BookingField,
  type BookingFormValues,
} from "./booking.validation";

/** What each section of the booking form needs to read and update the form. */
export interface BookingFormApi {
  values: BookingFormValues;
  /** Messages for fields the renter has already been through. */
  errors: BookingErrors;
  /** True once a field has been visited, filled in and found valid. */
  isValid: (field: BookingField) => boolean;
  set: <F extends BookingField>(field: F, value: BookingFormValues[F]) => void;
  /** Marks a field as visited, so its message may show. */
  touch: (field: BookingField) => void;
}

/**
 * State for the booking form. Every change re-validates the whole form, and a
 * field's message appears once the renter has left that field or tried to send.
 */
export function useBookingForm(returnDate: string) {
  const [values, setValues] = useState(EMPTY_BOOKING_FORM);
  const [touched, setTouched] = useState<Set<BookingField>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const allErrors = validateBooking(values, returnDate);
  const shown = (field: BookingField) => submitted || touched.has(field);
  const errors = Object.fromEntries(
    Object.entries(allErrors).filter(([field]) => shown(field as BookingField)),
  ) as BookingErrors;

  const touch = (field: BookingField) =>
    setTouched((current) =>
      current.has(field) ? current : new Set(current).add(field),
    );

  const form: BookingFormApi = {
    values,
    errors,
    isValid: (field) => touched.has(field) && !allErrors[field],
    set: (field, value) =>
      setValues((current) => ({ ...current, [field]: value })),
    touch,
  };

  return {
    form,
    /** Reveals every message; returns whether the form can be sent. */
    submit: () => {
      setSubmitted(true);
      return Object.keys(allErrors).length === 0;
    },
    /** How many fields still need fixing, counting only those shown. */
    errorCount: Object.keys(errors).length,
  };
}
