import { useTranslations } from "next-intl";
import { DateField } from "@/shared/ui/molecules/DateField";
import { ImageUploadField } from "@/shared/ui/molecules/ImageUploadField";
import { TextField } from "@/shared/ui/molecules/TextField";
import type { BookingFormApi } from "../booking.form";
import { DOCUMENT_TYPES } from "../booking.validation";
import { BookingSection } from "./BookingSection";

/** The driving licence and proof of insurance. */
export function BookingDocumentsSection({ form }: { form: BookingFormApi }) {
  const t = useTranslations("booking.documents");
  const { values, errors, set, touch, isValid } = form;
  return (
    <BookingSection title={t("title")} description={t("description")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-field="licenceNumber">
          <TextField
            label={t("licenceNumber")}
            autoComplete="off"
            value={values.licenceNumber}
            onChange={(event) => set("licenceNumber", event.target.value)}
            onBlur={() => touch("licenceNumber")}
            error={errors.licenceNumber}
            valid={isValid("licenceNumber")}
          />
        </div>
        <div data-field="licenceExpiry">
          <DateField
            legend={t("licenceExpiry")}
            value={values.licenceExpiry}
            onChange={(date) => set("licenceExpiry", date)}
            onBlur={() => touch("licenceExpiry")}
            error={errors.licenceExpiry}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-field="licencePhoto">
          <ImageUploadField
            label={t("licencePhoto")}
            hint={t("licencePhotoHint")}
            accept={DOCUMENT_TYPES}
            value={values.licencePhoto}
            onChange={(file) => {
              set("licencePhoto", file);
              touch("licencePhoto");
            }}
            error={errors.licencePhoto}
          />
        </div>
        <div data-field="insurancePhoto">
          <ImageUploadField
            label={t("insurancePhoto")}
            hint={t("insurancePhotoHint")}
            accept={DOCUMENT_TYPES}
            value={values.insurancePhoto}
            onChange={(file) => {
              set("insurancePhoto", file);
              touch("insurancePhoto");
            }}
            error={errors.insurancePhoto}
          />
        </div>
      </div>
    </BookingSection>
  );
}
