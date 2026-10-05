import { DateField } from "@/shared/ui/molecules/DateField";
import type { ListboxOption } from "@/shared/ui/molecules/Listbox";
import { Select } from "@/shared/ui/molecules/Select";
import { TextField } from "@/shared/ui/molecules/TextField";
import type { BookingFormApi } from "../booking.form";
import type { Gender } from "../types";
import { BookingSection } from "./BookingSection";

const GENDERS: ListboxOption<Gender>[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "undisclosed", label: "Prefer not to say" },
];

/** Who is renting: name, contact details, gender, date of birth and address. */
export function BookingDriverSection({ form }: { form: BookingFormApi }) {
  const { values, errors, set, touch, isValid } = form;
  return (
    <BookingSection
      title="Your details"
      description="The main driver's details, used for the rental agreement."
    >
      <div data-field="name">
        <TextField
          label="Full name"
          hint="As it appears on your driving licence."
          autoComplete="name"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          onBlur={() => touch("name")}
          error={errors.name}
          valid={isValid("name")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-field="email">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
            onBlur={() => touch("email")}
            error={errors.email}
            valid={isValid("email")}
          />
        </div>
        <div data-field="phone">
          <TextField
            label="Phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            onBlur={() => touch("phone")}
            error={errors.phone}
            valid={isValid("phone")}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-field="gender">
          <Select
            label="Gender"
            options={GENDERS}
            value={values.gender}
            onChange={(gender) => set("gender", gender)}
            onBlur={() => touch("gender")}
            error={errors.gender}
          />
        </div>
        <div data-field="dateOfBirth">
          <DateField
            legend="Date of birth"
            birthday
            value={values.dateOfBirth}
            onChange={(date) => set("dateOfBirth", date)}
            onBlur={() => touch("dateOfBirth")}
            error={errors.dateOfBirth}
          />
        </div>
      </div>
      <div data-field="address">
        <TextField
          label="Home address"
          autoComplete="street-address"
          value={values.address}
          onChange={(event) => set("address", event.target.value)}
          onBlur={() => touch("address")}
          error={errors.address}
          valid={isValid("address")}
        />
      </div>
    </BookingSection>
  );
}
