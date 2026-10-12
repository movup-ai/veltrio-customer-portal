import { useTranslations } from "next-intl";
import { DateField } from "@/shared/ui/molecules/DateField";
import { Select } from "@/shared/ui/molecules/Select";
import { TextField } from "@/shared/ui/molecules/TextField";
import type { BookingFormApi } from "../booking.form";
import type { Gender } from "../types";
import { BookingSection } from "./BookingSection";

const GENDERS: Gender[] = ["female", "male", "non_binary", "undisclosed"];

/** Who is renting: name, contact details, gender, date of birth and address. */
export function BookingDriverSection({ form }: { form: BookingFormApi }) {
  const t = useTranslations("booking.driver");
  const { values, errors, set, touch, isValid } = form;
  return (
    <BookingSection title={t("title")} description={t("description")}>
      <div data-field="name">
        <TextField
          label={t("name")}
          hint={t("nameHint")}
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
            label={t("email")}
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
            label={t("phone")}
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
            label={t("gender")}
            options={GENDERS.map((gender) => ({
              value: gender,
              label: t(`genders.${gender}`),
            }))}
            value={values.gender}
            onChange={(gender) => set("gender", gender)}
            onBlur={() => touch("gender")}
            error={errors.gender}
          />
        </div>
        <div data-field="dateOfBirth">
          <DateField
            legend={t("birth")}
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
          label={t("address")}
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
