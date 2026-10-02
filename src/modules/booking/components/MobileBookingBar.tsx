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
  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-surface lg:hidden">
      <div className="container-page flex items-center gap-4 py-3">
        <p className="min-w-0 flex-1">
          {dailyRateCents === null ? (
            <span className="font-semibold">Price on request</span>
          ) : (
            <>
              <span className="text-lead font-bold">
                {formatMoney(dailyRateCents)}
              </span>{" "}
              day
            </>
          )}
        </p>
        <Button asChild>
          <a href={href}>Check availability</a>
        </Button>
      </div>
    </div>
  );
}
