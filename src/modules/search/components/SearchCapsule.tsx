"use client";

import { format } from "date-fns";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";
import type { VehicleType } from "@/modules/vehicle/types";
import {
  VEHICLE_TYPE_META,
  VEHICLE_TYPE_ORDER,
} from "@/modules/vehicle/vehicle-types";
import { track } from "@/shared/lib/analytics";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";
import { MARKETS, type Market } from "../markets";
import { buildSearchUrl, type SearchQuery } from "../search-params";
import { DateRangePicker } from "./DateRangePicker";
import { SearchField } from "./SearchField";

type Field = "location" | "dates" | "type";

interface SearchCapsuleProps {
  /** Pre-fills the fields, e.g. from the current URL on the results page. */
  initialQuery?: SearchQuery;
  markets?: Market[];
  className?: string;
}

const toIso = (date: Date) => format(date, "yyyy-MM-dd");
const fromIso = (iso: string) => new Date(`${iso}T00:00:00`);

function Divider() {
  return <span aria-hidden className="my-3 hidden w-px bg-border md:block" />;
}

export function SearchCapsule({
  initialQuery,
  markets = MARKETS,
  className,
}: SearchCapsuleProps) {
  const router = useRouter();
  const [openField, setOpenField] = useState<Field | null>(null);
  const [location, setLocation] = useState(initialQuery?.location);
  const [type, setType] = useState(initialQuery?.type);
  const [range, setRange] = useState<DateRange | undefined>(
    initialQuery?.pickup && initialQuery.return
      ? { from: fromIso(initialQuery.pickup), to: fromIso(initialQuery.return) }
      : undefined,
  );

  const market = markets.find((m) => m.slug === location);
  const popoverProps = (field: Field) => ({
    open: openField === field,
    onOpenChange: (open: boolean) => setOpenField(open ? field : null),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query: SearchQuery = {
      location,
      pickup: range?.from && range.to ? toIso(range.from) : undefined,
      return: range?.from && range.to ? toIso(range.to) : undefined,
      type,
    };
    track("search_submitted", query);
    router.push(buildSearchUrl(query));
  };

  return (
    <form
      role="search"
      aria-label="Find a rental car"
      onSubmit={submit}
      className={cn(
        "flex max-w-4xl flex-col gap-1.5 rounded-xl bg-surface p-2 text-foreground shadow-search md:flex-row md:items-stretch md:gap-0 md:rounded-full",
        className,
      )}
    >
      <Popover {...popoverProps("location")}>
        <PopoverTrigger asChild>
          <SearchField
            label="Pick-up"
            placeholder="Choose a city"
            value={market && `${market.name}, ${market.region}`}
            className="md:flex-[1.3]"
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-3">
          <ul aria-label="Cities">
            {markets.map((m) => (
              <li key={m.slug}>
                <button
                  type="button"
                  aria-pressed={m.slug === location}
                  onClick={() => {
                    setLocation(m.slug);
                    setOpenField(null);
                  }}
                  className="flex w-full items-center gap-3.5 rounded-md p-2.5 text-left hover:bg-surface-muted aria-pressed:bg-surface-muted"
                >
                  <span className="grid size-11 place-items-center rounded-md bg-surface-muted">
                    <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-semibold">
                    {m.name}, {m.region}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      <Divider />

      <Popover {...popoverProps("dates")}>
        <PopoverTrigger asChild>
          <SearchField
            label="Dates"
            placeholder="Add pick-up and return"
            value={
              range?.from && range.to
                ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
                : undefined
            }
            className="md:flex-[1.3]"
          />
        </PopoverTrigger>
        <PopoverContent align="center">
          <DateRangePicker value={range} onChange={setRange} />
          <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRange(undefined)}
            >
              Clear
            </Button>
            <Button variant="dark" size="sm" onClick={() => setOpenField(null)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Divider />

      <Popover {...popoverProps("type")}>
        <PopoverTrigger asChild>
          <SearchField
            label="Vehicle"
            placeholder="Any type"
            value={type && VEHICLE_TYPE_META[type].label}
          />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-88">
          <ul aria-label="Vehicle types" className="grid grid-cols-2 gap-2">
            {VEHICLE_TYPE_ORDER.map((value: VehicleType) => {
              const { label, icon: Icon } = VEHICLE_TYPE_META[value];
              const selected = value === type;
              return (
                <li key={value}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setType(selected ? undefined : value);
                      setOpenField(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md border border-border p-3.5 text-sm font-medium hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-surface-muted"
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        size="lg"
        className="mt-1 md:mt-0 md:ml-1.5 md:self-center"
      >
        <Search aria-hidden className="size-5" />
        Search
      </Button>
    </form>
  );
}
