import { useTranslations } from "next-intl";
import { Link } from "@/i18n/Link";
import { formatMoney } from "@/shared/lib/format";
import { Button } from "@/shared/ui/atoms/Button";

interface MobileBookingBarProps {
  dailyRateCents: number | null;
  /** Anchor of the booking panel on the same page, e.g. "#booking". */
  href: string;
}

/** Sticky price and call to action for small screens, where the panel is further down. */
export function MobileBookingBar({
  dailyRateCents,
  href,
}: MobileBookingBarProps) {
  const t = useTranslations("vehicle");
  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-surface lg:hidden">
      <div className="container-page flex items-center gap-4 py-3">
        <p className="min-w-0 flex-1">
          {dailyRateCents === null ? (
            <span className="font-semibold">{t("booking.onRequest")}</span>
          ) : (
            <>
              {t.rich("card.rate", {
                price: formatMoney(dailyRateCents),
                b: (chunks) => (
                  <span className="text-lead font-bold">{chunks}</span>
                ),
              })}
            </>
          )}
        </p>
        <Button asChild>
          <Link href={href}>{t("booking.checkAvailability")}</Link>
        </Button>
      </div>
    </div>
  );
}
