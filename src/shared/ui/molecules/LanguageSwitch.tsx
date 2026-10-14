"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/shared/lib/cn";
import { Flag } from "@/shared/ui/atoms/Flag";
import { ListboxContent } from "@/shared/ui/molecules/Listbox";
import { Popover, PopoverTrigger } from "@/shared/ui/molecules/Popover";

/** The flag shown beside each language. */
const FLAG = { en: "us", es: "es" } as const;

/** Shows the language being read and opens a list to change it, staying on the same page. */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("common.language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${t("label")}: ${t(locale)}`}
          className={cn(
            "group flex h-10 items-center gap-2 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap hover:bg-current/10 sm:px-3",
            className,
          )}
        >
          <Flag country={FLAG[locale]} />
          {/* The code is enough here; the list names each language in full. */}
          <span aria-hidden className="uppercase">
            {locale}
          </span>
          <ChevronDown
            aria-hidden
            className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </PopoverTrigger>
      <ListboxContent
        label={t("label")}
        id={listId}
        align="end"
        options={routing.locales.map((each) => ({
          value: each,
          label: t(each),
          icon: <Flag country={FLAG[each]} />,
          lang: each,
        }))}
        value={locale}
        onSelect={(next) => {
          setOpen(false);
          if (next !== locale) {
            router.replace(pathname + window.location.search, { locale: next });
          }
        }}
        className="min-w-44"
      />
    </Popover>
  );
}
