"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/shared/lib/cn";

/** Switches the page to the other language, staying on the same page. */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("common.language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  // With two languages the control is a toggle: it names the one you are not reading.
  const other = routing.locales.find((each) => each !== locale) ?? locale;

  return (
    <button
      type="button"
      lang={other}
      aria-label={`${t("label")}: ${t(other)}`}
      onClick={() =>
        router.replace(pathname + window.location.search, { locale: other })
      }
      className={cn(
        "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-current/10",
        className,
      )}
    >
      <Globe aria-hidden className="size-4" strokeWidth={1.75} />
      {t(other)}
    </button>
  );
}
