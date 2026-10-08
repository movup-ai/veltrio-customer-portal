"use client";

import { format } from "date-fns";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { track } from "@/shared/lib/analytics";
import { cn } from "@/shared/lib/cn";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { formatTime, HOURLY_TIMES } from "@/shared/lib/time";
import { Button } from "@/shared/ui/atoms/Button";
import { DateRangePicker } from "@/shared/ui/molecules/DateRangePicker";
import { ListboxContent } from "@/shared/ui/molecules/Listbox";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";
import { cityLabel, citySlug, findCity, type City } from "../cities";
import { loadRecentSearch, saveRecentSearch } from "../recent-search";
import { buildSearchUrl, type SearchQuery } from "../search-params";
import { completeTrip, type Trip } from "../trip";
import { SearchField } from "./SearchField";
import { SearchPicker } from "./SearchPicker";

type End = "pickup" | "return";
type Field = "location" | "dates" | `${End}Time`;

interface SearchCapsuleProps {
  /** Pre-fills the fields, e.g. from the current URL on the results page. */
  initialQuery?: SearchQuery;
  /** Cities with vehicles to rent, as the API lists them. */
  cities: City[];
  className?: string;
}

const TIME_OPTIONS = HOURLY_TIMES.map((time) => ({
  value: time,
  label: formatTime(time),
}));

function Divider() {
  return <span aria-hidden className="my-2 hidden w-px bg-border md:block" />;
}

/** A labelled segment holding a date and a time dropdown side by side. */
function Segment({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg bg-background px-4 py-1.5 md:bg-transparent">
      <span className="type-label text-muted">{label}</span>
      <div className="mt-0.5 flex gap-4">{children}</div>
    </div>
  );
}

export function SearchCapsule({
  initialQuery,
  cities,
  className,
}: SearchCapsuleProps) {
  const router = useRouter();
  const [openField, setOpenField] = useState<Field | null>(null);
  const [location, setLocation] = useState(initialQuery?.location);
  const [trip, setTrip] = useState<Trip>({
    pickup: initialQuery?.pickup,
    pickupTime: initialQuery?.pickupTime,
    return: initialQuery?.return,
    returnTime: initialQuery?.returnTime,
  });

  // After mount, so the first render matches the server's empty form.
  useEffect(() => {
    if (initialQuery) return;
    const recent = loadRecentSearch(toIsoDate(new Date()));
    if (!recent) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once
    setLocation(recent.location);
    setTrip({
      pickup: recent.pickup,
      pickupTime: recent.pickupTime,
      return: recent.return,
      returnTime: recent.returnTime,
    });
  }, [initialQuery]);

  const city = findCity(cities, location);
  const from = fromIsoDate(trip.pickup);
  const to = fromIsoDate(trip.return);
  const popoverProps = (field: Field) => ({
    open: openField === field,
    onOpenChange: (open: boolean) => setOpenField(open ? field : null),
  });

  /** Takes the calendar's days; each end's time is filled in when it has none. */
  const changeDates = (range: DateRange | undefined) => {
    if (!range?.from) return setTrip({});
    const pickup = toIsoDate(range.from);
    const next = { ...trip, pickup, return: toIsoDate(range.to ?? range.from) };
    setTrip(completeTrip(next, pickup === trip.pickup ? "return" : "pickup"));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query: SearchQuery = {
      location,
      ...(trip.pickup && trip.return && trip),
    };
    saveRecentSearch(query);
    track("search_submitted", query);
    router.push(buildSearchUrl(query));
  };

  const timePicker = (end: End, label: string) => {
    const field = `${end}Time` as const;
    return (
      <Popover {...popoverProps(field)}>
        <PopoverTrigger asChild>
          <SearchPicker
            label={label}
            placeholder="Add time"
            value={trip[field] && formatTime(trip[field])}
            aria-haspopup="listbox"
          />
        </PopoverTrigger>
        <ListboxContent
          label={label}
          options={TIME_OPTIONS}
          value={trip[field]}
          onSelect={(time) => {
            setTrip(completeTrip({ ...trip, [field]: time }, end));
            setOpenField(null);
          }}
          className="w-44"
        />
      </Popover>
    );
  };

  return (
    <form
      role="search"
      aria-label="Find a rental car"
      onSubmit={submit}
      className={cn(
        "flex max-w-5xl flex-col gap-2 rounded-xl bg-surface p-1 text-foreground shadow-search md:flex-row md:items-stretch md:gap-0",
        className,
      )}
    >
      <Popover {...popoverProps("location")}>
        <PopoverTrigger asChild>
          <SearchField
            label="Where"
            placeholder="Choose a city"
            value={city && cityLabel(city)}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-3">
          {cities.length === 0 && (
            <p className="p-2 text-sm text-muted">
              No cities are available right now.
            </p>
          )}
          <ul aria-label="Cities" className="max-h-80 overflow-y-auto">
            {cities.map((option) => {
              const slug = citySlug(option);
              return (
                <li key={slug}>
                  <button
                    type="button"
                    aria-pressed={slug === location}
                    onClick={() => {
                      setLocation(slug);
                      setOpenField(null);
                    }}
                    className="flex w-full items-center gap-4 rounded-md p-2 text-left hover:bg-surface-muted aria-pressed:bg-surface-muted"
                  >
                    <span className="grid size-11 place-items-center rounded-md bg-surface-muted">
                      <MapPin
                        aria-hidden
                        className="size-5"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span>
                      <span className="block font-semibold">
                        {cityLabel(option)}
                      </span>
                      <span className="block text-sm text-muted">
                        {option.vehicleCount === 1
                          ? "1 car"
                          : `${option.vehicleCount} cars`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
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
                  value={from && format(from, "MMM d")}
                />
              </PopoverTrigger>
              {timePicker("pickup", "Pick-up time")}
            </Segment>
            <Divider />
            <Segment label="Until">
              <SearchPicker
                label="Return date"
                placeholder="Add dates"
                value={to && format(to, "MMM d")}
                aria-haspopup="dialog"
                aria-expanded={openField === "dates"}
                onClick={() => setOpenField("dates")}
              />
              {timePicker("return", "Return time")}
            </Segment>
          </div>
        </PopoverAnchor>
        <PopoverContent align="center">
          <DateRangePicker
            sameDay
            outlined
            value={from && { from, to }}
            onChange={changeDates}
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => setTrip({})}>
                  Reset
                </Button>
                <Button size="sm" onClick={() => setOpenField(null)}>
                  Save
                </Button>
              </>
            }
          />
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        className="rounded-lg md:mr-1 md:ml-1.5 md:w-11 md:self-center md:px-0 md:has-[>svg:first-child]:pl-0"
      >
        <Search aria-hidden className="size-5" />
        <span className="md:sr-only">Search</span>
      </Button>
    </form>
  );
}
