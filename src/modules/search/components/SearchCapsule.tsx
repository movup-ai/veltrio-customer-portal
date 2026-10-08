"use client";

import { format } from "date-fns";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { track } from "@/shared/lib/analytics";
import { cn } from "@/shared/lib/cn";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { DEFAULT_TIME, formatTime, HOURLY_TIMES } from "@/shared/lib/time";
import { Button } from "@/shared/ui/atoms/Button";
import { DateRangePicker } from "@/shared/ui/molecules/DateRangePicker";
import { ListboxContent } from "@/shared/ui/molecules/Listbox";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";
import { MARKETS, type Market } from "../markets";
import { buildSearchUrl, type SearchQuery } from "../search-params";
import { SearchField } from "./SearchField";
import { SearchPicker } from "./SearchPicker";

type TimeField = "pickupTime" | "returnTime";
type Field = "location" | "dates" | TimeField;

interface SearchCapsuleProps {
  /** Pre-fills the fields, e.g. from the current URL on the results page. */
  initialQuery?: SearchQuery;
  markets?: Market[];
  className?: string;
}

const TIME_OPTIONS = HOURLY_TIMES.map((time) => ({
  value: time,
  label: formatTime(time),
}));

function Divider() {
  return <span aria-hidden className="my-3 hidden w-px bg-border md:block" />;
}

/** A labelled segment holding a date and a time dropdown side by side. */
function Segment({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg bg-background px-4 py-3 md:bg-transparent">
      <span className="type-label text-muted">{label}</span>
      <div className="mt-1 flex gap-4">{children}</div>
    </div>
  );
}

export function SearchCapsule({
  initialQuery,
  markets = MARKETS,
  className,
}: SearchCapsuleProps) {
  const router = useRouter();
  const [openField, setOpenField] = useState<Field | null>(null);
  const [location, setLocation] = useState(initialQuery?.location);
  const [range, setRange] = useState<DateRange | undefined>(
    initialQuery?.pickup && initialQuery.return
      ? {
          from: fromIsoDate(initialQuery.pickup),
          to: fromIsoDate(initialQuery.return),
        }
      : undefined,
  );
  const [times, setTimes] = useState({
    pickupTime: initialQuery?.pickupTime,
    returnTime: initialQuery?.returnTime,
  });

  const market = markets.find((m) => m.slug === location);
  const popoverProps = (field: Field) => ({
    open: openField === field,
    onOpenChange: (open: boolean) => setOpenField(open ? field : null),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query: SearchQuery = {
      location,
      ...(range?.from &&
        range.to && {
          pickup: toIsoDate(range.from),
          pickupTime: times.pickupTime ?? DEFAULT_TIME,
          return: toIsoDate(range.to),
          returnTime: times.returnTime ?? DEFAULT_TIME,
        }),
    };
    track("search_submitted", query);
    router.push(buildSearchUrl(query));
  };

  const timePicker = (field: TimeField, label: string) => (
    <Popover {...popoverProps(field)}>
      <PopoverTrigger asChild>
        <SearchPicker
          label={label}
          placeholder="Add time"
          value={times[field] && formatTime(times[field])}
          aria-haspopup="listbox"
        />
      </PopoverTrigger>
      <ListboxContent
        label={label}
        options={TIME_OPTIONS}
        value={times[field]}
        onSelect={(time) => {
          setTimes({ ...times, [field]: time });
          setOpenField(null);
        }}
        className="w-44"
      />
    </Popover>
  );

  return (
    <form
      role="search"
      aria-label="Find a rental car"
      onSubmit={submit}
      className={cn(
        "flex max-w-5xl flex-col gap-2 rounded-xl bg-surface p-2 text-foreground shadow-search md:flex-row md:items-stretch md:gap-0",
        className,
      )}
    >
      <Popover {...popoverProps("location")}>
        <PopoverTrigger asChild>
          <SearchField
            label="Where"
            placeholder="Choose a city"
            value={market && `${market.name}, ${market.region}`}
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
                  className="flex w-full items-center gap-4 rounded-md p-2 text-left hover:bg-surface-muted aria-pressed:bg-surface-muted"
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

      {/* One calendar picks both dates, so it hangs under both segments. */}
      <Popover {...popoverProps("dates")}>
        <PopoverAnchor asChild>
          <div className="flex flex-col gap-2 md:flex-2 md:flex-row md:gap-0">
            <Segment label="From">
              <PopoverTrigger asChild>
                <SearchPicker
                  label="Pick-up date"
                  placeholder="Add dates"
                  value={range?.from && format(range.from, "MMM d")}
                />
              </PopoverTrigger>
              {timePicker("pickupTime", "Pick-up time")}
            </Segment>
            <Divider />
            <Segment label="Until">
              <SearchPicker
                label="Return date"
                placeholder="Add dates"
                value={range?.to && format(range.to, "MMM d")}
                aria-haspopup="dialog"
                aria-expanded={openField === "dates"}
                onClick={() => setOpenField("dates")}
              />
              {timePicker("returnTime", "Return time")}
            </Segment>
          </div>
        </PopoverAnchor>
        <PopoverContent align="center">
          <DateRangePicker
            value={range}
            onChange={setRange}
            actions={
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRange(undefined)}
                >
                  Clear
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => setOpenField(null)}
                >
                  Done
                </Button>
              </>
            }
          />
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        size="lg"
        className="rounded-lg md:ml-2 md:w-13 md:self-center md:px-0 md:has-[>svg:first-child]:pl-0"
      >
        <Search aria-hidden className="size-5" />
        <span className="md:sr-only">Search</span>
      </Button>
    </form>
  );
}
