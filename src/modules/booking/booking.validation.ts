import { differenceInYears, startOfToday } from "date-fns";
import {
  EMPTY_DATE,
  fromIsoDate,
  isoFromParts,
  type DateParts,
} from "@/shared/lib/date";
import type messages from "../../../messages/en/booking.json";
import type {
  BookingCustomer,
  BookingRequest,
  Gender,
  PaymentMethod,
  PaymentTiming,
} from "./types";

/** The same limits the API enforces on a renter (CustomerWrite) and on documents. */
export const MIN_RENTER_AGE = 18;
const MAX_RENTER_AGE = 110;
export const NOTES_MAX_LENGTH = 500;
export const DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const PHONE_CHARACTERS = /^\+?[\d\s().-]+$/;
const LICENCE_NUMBER = /^[A-Za-z0-9][A-Za-z0-9 -]*$/;

/** Everything the booking form holds, as typed. */
export interface BookingFormValues {
  name: string;
  email: string;
  phone: string;
  gender: Gender | "";
  dateOfBirth: DateParts;
  address: string;
  licenceNumber: string;
  licenceExpiry: DateParts;
  licencePhoto: File | null;
  insurancePhoto: File | null;
  paymentMethod: PaymentMethod | "";
  paymentTiming: PaymentTiming | "";
  /** The branch the car comes back to; empty for the one it is picked up at. */
  returnLocation: string;
  notes: string;
}

export type BookingField = keyof BookingFormValues;
/** What is wrong with a field: the name of its message under `booking.errors`. */
export type BookingErrorCode = keyof typeof messages.errors;
export type BookingErrors = Partial<Record<BookingField, BookingErrorCode>>;

export const EMPTY_BOOKING_FORM: BookingFormValues = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: EMPTY_DATE,
  address: "",
  licenceNumber: "",
  licenceExpiry: EMPTY_DATE,
  licencePhoto: null,
  insurancePhoto: null,
  paymentMethod: "",
  paymentTiming: "",
  returnLocation: "",
  notes: "",
};

/** Fields in the order they appear, for moving focus to the first problem. */
export const BOOKING_FIELD_ORDER: BookingField[] = [
  "name",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "address",
  "licenceNumber",
  "licenceExpiry",
  "licencePhoto",
  "insurancePhoto",
  "paymentMethod",
  "paymentTiming",
  "notes",
];

function documentError(file: File): BookingErrorCode | undefined {
  if (!DOCUMENT_TYPES.includes(file.type)) {
    return "photoType";
  }
  if (file.size > DOCUMENT_MAX_BYTES) return "photoSize";
  return undefined;
}

/**
 * Checks the whole booking form and names what is wrong with each field that
 * needs fixing. `returnDate` is the rental's last day, "YYYY-MM-DD".
 */
export function validateBooking(
  values: BookingFormValues,
  returnDate: string,
): BookingErrors {
  const errors: BookingErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "nameRequired";
  else if (name.length < 2) errors.name = "nameRequired";
  else if (name.length > 80) errors.name = "nameTooLong";
  else if (/\d/.test(name)) errors.name = "nameDigits";

  const email = values.email.trim();
  if (!email) errors.email = "emailRequired";
  else if (!EMAIL.test(email) || email.length > 254) {
    errors.email = "emailInvalid";
  }

  const phone = values.phone.trim();
  const digits = phone.replace(/\D/g, "").length;
  if (!phone) errors.phone = "phoneRequired";
  else if (!PHONE_CHARACTERS.test(phone)) {
    errors.phone = "phoneCharacters";
  } else if (digits < 7 || digits > 15) {
    errors.phone = "phoneLength";
  }

  if (!values.gender) errors.gender = "genderRequired";

  const dateOfBirth = isoFromParts(values.dateOfBirth);
  if (dateOfBirth === "empty") {
    errors.dateOfBirth = "birthRequired";
  } else if (dateOfBirth === null) {
    errors.dateOfBirth = "birthInvalid";
  } else {
    const age = differenceInYears(startOfToday(), fromIsoDate(dateOfBirth)!);
    if (age < 0) errors.dateOfBirth = "birthFuture";
    else if (age < MIN_RENTER_AGE) {
      errors.dateOfBirth = "birthTooYoung";
    } else if (age > MAX_RENTER_AGE) {
      errors.dateOfBirth = "birthYear";
    }
  }

  const address = values.address.trim();
  if (!address) errors.address = "addressRequired";
  else if (address.length < 5) errors.address = "addressShort";
  else if (address.length > 160) errors.address = "addressTooLong";

  const licenceNumber = values.licenceNumber.trim();
  if (!licenceNumber) errors.licenceNumber = "licenceRequired";
  else if (!LICENCE_NUMBER.test(licenceNumber)) {
    errors.licenceNumber = "licenceCharacters";
  } else if (licenceNumber.length < 3 || licenceNumber.length > 30) {
    errors.licenceNumber = "licenceLength";
  }

  const licenceExpiry = isoFromParts(values.licenceExpiry);
  if (licenceExpiry === "empty") {
    errors.licenceExpiry = "expiryRequired";
  } else if (licenceExpiry === null) {
    errors.licenceExpiry = "expiryInvalid";
  } else if (licenceExpiry < returnDate) {
    // ISO dates compare correctly as strings.
    errors.licenceExpiry = "expiryBeforeReturn";
  }

  if (!values.licencePhoto) {
    errors.licencePhoto = "licencePhotoRequired";
  } else {
    const error = documentError(values.licencePhoto);
    if (error) errors.licencePhoto = error;
  }
  if (!values.insurancePhoto) {
    errors.insurancePhoto = "insurancePhotoRequired";
  } else {
    const error = documentError(values.insurancePhoto);
    if (error) errors.insurancePhoto = error;
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = "paymentMethodRequired";
  } else if (values.paymentMethod === "online" && !values.paymentTiming) {
    errors.paymentTiming = "paymentTimingRequired";
  }

  if (values.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = "notesTooLong";
  }

  return errors;
}

/** The parts of a booking request that come from a valid form. */
export function toBookingRequestParts(
  values: BookingFormValues,
): Pick<BookingRequest, "customer" | "payment" | "notes"> {
  const customer: BookingCustomer = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender as Gender,
    dateOfBirth: isoFromParts(values.dateOfBirth) as string,
    address: values.address.trim(),
    licenceNumber: values.licenceNumber.trim(),
    licenceExpiry: isoFromParts(values.licenceExpiry) as string,
  };
  const method = values.paymentMethod as PaymentMethod;
  return {
    customer,
    payment: {
      method,
      timing:
        method === "online" ? (values.paymentTiming as PaymentTiming) : null,
    },
    notes: values.notes.trim() || null,
  };
}
