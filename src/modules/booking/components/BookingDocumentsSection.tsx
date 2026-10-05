import { DateField } from "@/shared/ui/molecules/DateField";
import { ImageUploadField } from "@/shared/ui/molecules/ImageUploadField";
import { TextField } from "@/shared/ui/molecules/TextField";
import type { BookingFormApi } from "../booking.form";
import { DOCUMENT_TYPES } from "../booking.validation";
import { BookingSection } from "./BookingSection";

/** The driving licence and proof of insurance. */
export function BookingDocumentsSection({ form }: { form: BookingFormApi }) {
  const { values, errors, set, touch, isValid } = form;
  return (
    <BookingSection
      title="Licence and insurance"
      description="Clear photos let the company check your documents before you arrive. JPG, PNG, WebP or HEIC, up to 10 MB each."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-field="licenceNumber">
          <TextField
            label="Licence number"
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
            legend="Licence expiry date"
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
            label="Driving licence photo"
            hint="The front of the card."
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
            label="Insurance card photo"
            hint="Your current auto policy."
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
