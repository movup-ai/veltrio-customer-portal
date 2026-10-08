import { differenceInYears, startOfToday } from "date-fns";
import {
  EMPTY_DATE,
  fromIsoDate,
  isoFromParts,
  type DateParts,
} from "@/shared/lib/date";
import type {
  BookingCustomer,
  BookingRequest,
  Gender,
  PaymentMethod,
  PaymentTiming,
} from "./types";

/** The same limits the API enforces on a renter (CustomerWrite) and on documents. */
const MIN_RENTER_AGE = 18;
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
export type BookingErrors = Partial<Record<BookingField, string>>;

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

function documentError(file: File) {
  if (!DOCUMENT_TYPES.includes(file.type)) {
    return "Upload a JPG, PNG, WebP or HEIC photo.";
  }
  if (file.size > DOCUMENT_MAX_BYTES) return "Upload a photo of 10 MB or less.";
  return undefined;
}

/**
 * Checks the whole booking form and returns a message for each field that
 * needs fixing. `returnDate` is the rental's last day, "YYYY-MM-DD".
 */
export function validateBooking(
  values: BookingFormValues,
  returnDate: string,
): BookingErrors {
  const errors: BookingErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Enter your full name.";
  else if (name.length < 2) errors.name = "Enter your full name.";
  else if (name.length > 80) errors.name = "Use 80 characters or fewer.";
  else if (/\d/.test(name)) errors.name = "A name cannot contain numbers.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email) || email.length > 254) {
    errors.email = "Enter an email address like name@example.com.";
  }

  const phone = values.phone.trim();
  const digits = phone.replace(/\D/g, "").length;
  if (!phone) errors.phone = "Enter your phone number.";
  else if (!PHONE_CHARACTERS.test(phone)) {
    errors.phone = "Use only digits, spaces and + ( ) - in a phone number.";
  } else if (digits < 7 || digits > 15) {
    errors.phone = "Enter a phone number with 7 to 15 digits.";
  }

  if (!values.gender) errors.gender = "Select an option.";

  const dateOfBirth = isoFromParts(values.dateOfBirth);
  if (dateOfBirth === "empty") {
    errors.dateOfBirth = "Enter your date of birth.";
  } else if (dateOfBirth === null) {
    errors.dateOfBirth = "Enter a real date, like 04 27 1990.";
  } else {
    const age = differenceInYears(startOfToday(), fromIsoDate(dateOfBirth)!);
    if (age < 0) errors.dateOfBirth = "Your date of birth must be in the past.";
    else if (age < MIN_RENTER_AGE) {
      errors.dateOfBirth = `You must be at least ${MIN_RENTER_AGE} to rent.`;
    } else if (age > MAX_RENTER_AGE) {
      errors.dateOfBirth = "Check the year of your date of birth.";
    }
  }

  const address = values.address.trim();
  if (!address) errors.address = "Enter your home address.";
  else if (address.length < 5) errors.address = "Enter your full home address.";
  else if (address.length > 160)
    errors.address = "Use 160 characters or fewer.";

  const licenceNumber = values.licenceNumber.trim();
  if (!licenceNumber) errors.licenceNumber = "Enter your licence number.";
  else if (!LICENCE_NUMBER.test(licenceNumber)) {
    errors.licenceNumber = "Use only letters, numbers, spaces and hyphens.";
  } else if (licenceNumber.length < 3 || licenceNumber.length > 30) {
    errors.licenceNumber = "Enter a licence number of 3 to 30 characters.";
  }

  const licenceExpiry = isoFromParts(values.licenceExpiry);
  if (licenceExpiry === "empty") {
    errors.licenceExpiry = "Enter your licence expiry date.";
  } else if (licenceExpiry === null) {
    errors.licenceExpiry = "Enter a real date, like 08 15 2029.";
  } else if (licenceExpiry < returnDate) {
    // ISO dates compare correctly as strings.
    errors.licenceExpiry =
      "Your licence must be valid until you return the car.";
  }

  if (!values.licencePhoto) {
    errors.licencePhoto = "Add a photo of your driving licence.";
  } else {
    const error = documentError(values.licencePhoto);
    if (error) errors.licencePhoto = error;
  }
  if (!values.insurancePhoto) {
    errors.insurancePhoto = "Add a photo of your insurance card.";
  } else {
    const error = documentError(values.insurancePhoto);
    if (error) errors.insurancePhoto = error;
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = "Choose how you would like to pay.";
  } else if (values.paymentMethod === "online" && !values.paymentTiming) {
    errors.paymentTiming = "Choose when to pay the deposit.";
  }

  if (values.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Use ${NOTES_MAX_LENGTH} characters or fewer.`;
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
