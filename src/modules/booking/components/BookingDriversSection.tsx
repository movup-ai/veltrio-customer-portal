import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/shared/lib/format";
import { Button } from "@/shared/ui/atoms/Button";
import { DateField } from "@/shared/ui/molecules/DateField";
import { TextField } from "@/shared/ui/molecules/TextField";
import type { BookingFormApi } from "../booking.form";
import {
  emptyDriver,
  MAX_ADDITIONAL_DRIVERS,
  type DriverValues,
} from "../booking.validation";
import { BookingSection } from "./BookingSection";

interface BookingDriversSectionProps {
  form: BookingFormApi;
  /** What the company charges per driver per day, in cents. */
  priceCents: number;
  companyName: string;
}

/** Others the renter wants allowed to drive, each named on the agreement. */
export function BookingDriversSection({
  form,
  priceCents,
  companyName,
}: BookingDriversSectionProps) {
  const t = useTranslations("booking.drivers");
  const { values, driverErrors, set, touch } = form;
  const drivers = values.additionalDrivers;
  const update = (id: string, change: Partial<DriverValues>) =>
    set(
      "additionalDrivers",
      drivers.map((driver) =>
        driver.id === id ? { ...driver, ...change } : driver,
      ),
    );

  return (
    <BookingSection
      title={t("title")}
      description={
        priceCents > 0
          ? t("description", {
              company: companyName,
              price: formatMoney(priceCents),
            })
          : t("descriptionFree", { company: companyName })
      }
    >
      <div data-field="additionalDrivers" className="grid gap-4">
        {drivers.map((driver, index) => (
          <div
            key={driver.id}
            className="relative rounded-lg border border-border p-4"
          >
            <fieldset>
              <legend className="mb-4 font-semibold">
                {t("driverN", { number: index + 1 })}
              </legend>
              <div className="grid gap-4">
                <TextField
                  label={t("name")}
                  autoComplete="off"
                  value={driver.name}
                  onChange={(event) =>
                    update(driver.id, { name: event.target.value })
                  }
                  onBlur={() => touch("additionalDrivers")}
                  error={driverErrors[driver.id]?.name}
                />
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <TextField
                    label={t("licence")}
                    optional
                    autoComplete="off"
                    value={driver.licenceNumber}
                    onChange={(event) =>
                      update(driver.id, { licenceNumber: event.target.value })
                    }
                    onBlur={() => touch("additionalDrivers")}
                    error={driverErrors[driver.id]?.licenceNumber}
                  />
                  <TextField
                    label={t("state")}
                    optional
                    autoComplete="off"
                    value={driver.licenceState}
                    onChange={(event) =>
                      update(driver.id, { licenceState: event.target.value })
                    }
                    onBlur={() => touch("additionalDrivers")}
                    error={driverErrors[driver.id]?.licenceState}
                  />
                </div>
                <DateField
                  legend={t("expiry")}
                  optional
                  value={driver.licenceExpiry}
                  onChange={(licenceExpiry) =>
                    update(driver.id, { licenceExpiry })
                  }
                  onBlur={() => touch("additionalDrivers")}
                  error={driverErrors[driver.id]?.licenceExpiry}
                />
              </div>
            </fieldset>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("remove", { number: index + 1 })}
              className="absolute top-2 right-2"
              onClick={() =>
                set(
                  "additionalDrivers",
                  drivers.filter((each) => each.id !== driver.id),
                )
              }
            >
              <X aria-hidden className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      {drivers.length < MAX_ADDITIONAL_DRIVERS ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set("additionalDrivers", [
                ...drivers,
                emptyDriver(crypto.randomUUID()),
              ])
            }
          >
            <Plus aria-hidden className="size-4" />
            {t("add")}
          </Button>
        </div>
      ) : (
        <p className="text-meta text-muted">
          {t("max", { count: MAX_ADDITIONAL_DRIVERS, company: companyName })}
        </p>
      )}
      <p className="text-meta text-muted">{t("licenceAtPickup")}</p>
    </BookingSection>
  );
}
