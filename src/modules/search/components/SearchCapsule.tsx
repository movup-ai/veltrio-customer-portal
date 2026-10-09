"use client";

import { format } from "date-fns";
import { Building2, Globe, LocateFixed, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { siteConfig } from "@/shared/config/site";
import { track } from "@/shared/lib/analytics";
import { cn } from "@/shared/lib/cn";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { formatTime, HOURLY_TIMES } from "@/shared/lib/time";
import { Button } from "@/shared/ui/atoms/Button";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { DateRangePicker } from "@/shared/ui/molecules/DateRangePicker";
import { ListboxContent } from "@/shared/ui/molecules/Listbox";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";
import { cityLabel, citySlug, findCity, type City } from "../cities";
import { saveRecentSearch } from "../recent-search";
import {
  buildSearchUrl,
  type SearchPlace,
  type SearchQuery,
} from "../search-params";
import { completeTrip, type Trip } from "../trip";
import { SearchOption } from "./SearchOption";
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

// Google's library is only downloaded once someone types a place.
const PlaceSuggestions = dynamic(
  () => import("./PlaceSuggestions").then((module) => module.PlaceSuggestions),
  { ssr: false, loading: () => <Skeleton className="m-2 h-11" /> },
);

/** The location choice that searches every city. */
const ANYWHERE = "Anywhere";
/** Letters typed before places are looked up. */
const MIN_TYPED = 3;

/** Where to search: a city, a point with its name, or neither for everywhere. */
type Where = Pick<SearchQuery, "location" | "near" | "place">;

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
  const [where, setWhere] = useState<Where>({
    location: initialQuery?.location,
    near: initialQuery?.near,
    place: initialQuery?.place,
  });
  // What is being typed into "Where"; null while the box shows the chosen place.
  const [typed, setTyped] = useState<string | null>(null);
  const whereField = useRef<HTMLDivElement>(null);
  const whereListId = useId();
  // Counts every choice and edit of "Where", so a slow lookup can tell it was overtaken.
  const lookups = useRef(0);
  const [locateFailed, setLocateFailed] = useState(false);
  const apiKey = siteConfig.mapsKey;
  const [trip, setTrip] = useState<Trip>({
    pickup: initialQuery?.pickup,
    pickupTime: initialQuery?.pickupTime,
    return: initialQuery?.return,
    returnTime: initialQuery?.returnTime,
  });

  const found = findCity(cities, where.location);
  const city = found && { ...found, slug: citySlug(found) };
  // Every city, after the choice of none of them.
  const places = [
    {
      slug: undefined,
      label: ANYWHERE,
      detail: "Browse all cars",
      icon: Globe,
    },
    ...cities.map((each) => ({
      slug: citySlug(each),
      label: cityLabel(each),
      detail: each.vehicleCount === 1 ? "1 car" : `${each.vehicleCount} cars`,
      icon: Building2,
    })),
  ];
  // Empty until a place is chosen: nothing chosen searches everywhere.
  const chosen = where.near
    ? (where.place ?? "Chosen place")
    : city
      ? cityLabel(city)
      : "";
  const text = typed?.trim() ?? "";
  const matching = places.filter(({ label }) =>
    label.toLowerCase().includes(text.toLowerCase()),
  );
  // Long enough to ask Google for addresses as well.
  const lookUp = text.length >= MIN_TYPED;
  const from = fromIsoDate(trip.pickup);
  const to = fromIsoDate(trip.return);
  const popoverProps = (field: Field) => ({
    open: openField === field,
    onOpenChange: (open: boolean) => setOpenField(open ? field : null),
  });

  const choose = (next: Where) => {
    lookups.current += 1;
    setWhere(next);
    setTyped(null);
    setOpenField(null);
  };

  /** Chooses a place that is still being looked up, unless the renter has moved on by then. */
  const chooseWhenFound = (
    place: Promise<SearchPlace | null>,
    onNone?: () => void,
  ) => {
    const mine = ++lookups.current;
    place.then(
      (found) => {
        if (mine !== lookups.current) return;
        if (found) choose({ near: found, place: found.label });
        else onNone?.();
      },
      () => undefined,
    );
  };

  const locate = () =>
    chooseWhenFound(
      new Promise((resolve) => {
        // Some browsers, and pages not served securely, have no location to ask for.
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            resolve({
              lat: coords.latitude,
              lng: coords.longitude,
              label: "your location",
            }),
          () => resolve(null),
        );
      }),
      () => setLocateFailed(true),
    );

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
      // On the results page, the filters already chosen stay.
      ...initialQuery,
      location: undefined,
      near: undefined,
      place: undefined,
      ...where,
      pickup: undefined,
      pickupTime: undefined,
      return: undefined,
      returnTime: undefined,
      ...(trip.pickup && trip.return && trip),
    };
    saveRecentSearch(query);
    // Where exactly someone searched from is not analytics' business.
    const tracked = { ...query, near: undefined, place: undefined };
    track("search_submitted", tracked);
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
      <Popover
        open={openField === "location"}
        onOpenChange={(open) => {
          setOpenField(open ? "location" : null);
          // Closing without a choice puts the chosen place back in the box.
          if (!open) {
            lookups.current += 1;
            setTyped(null);
          }
        }}
      >
        <PopoverAnchor asChild>
          <div
            ref={whereField}
            className="relative flex min-w-0 flex-1 rounded-lg bg-background transition-colors hover:bg-surface-muted has-[input:focus]:bg-surface has-[input:focus]:shadow-2 md:bg-transparent"
          >
            <label className="flex min-w-0 flex-1 cursor-text flex-col justify-center py-1.5 pr-10 pl-4">
              <span className="type-label text-muted">Where</span>
              <input
                type="text"
                role="combobox"
                aria-expanded={openField === "location"}
                aria-controls={whereListId}
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="City, address or ZIP code"
                value={typed ?? chosen}
                onFocus={(event) => {
                  event.target.select();
                  setOpenField("location");
                }}
                onClick={() => setOpenField("location")}
                onChange={(event) => {
                  lookups.current += 1;
                  setTyped(event.target.value);
                  setOpenField("location");
                }}
                onKeyDown={(event) => {
                  // Enter on a half-typed place goes to the suggestions, not to a search.
                  const toList =
                    event.key === "ArrowDown" ||
                    (event.key === "Enter" && typed !== null);
                  if (!toList) return;
                  event.preventDefault();
                  document
                    .getElementById(whereListId)
                    ?.querySelector("button")
                    ?.focus();
                }}
                className="mt-0.5 w-full truncate bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-muted"
              />
            </label>
            {(typed ?? chosen) && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear location"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted"
                onClick={() => {
                  setWhere({});
                  lookups.current += 1;
                  setTyped("");
                  setOpenField("location");
                  whereField.current?.querySelector("input")?.focus();
                }}
              >
                <X aria-hidden className="size-4" />
              </Button>
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          id={whereListId}
          align="start"
          className="w-96 p-3"
          // Focus stays in the box, so typing carries on while the list is open.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (whereField.current?.contains(event.target as Node)) {
              event.preventDefault();
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const options = [...event.currentTarget.querySelectorAll("button")];
            const index = options.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next = options[index + (event.key === "ArrowDown" ? 1 : -1)];
            // Up from the first option goes back to the box.
            (next ?? whereField.current?.querySelector("input"))?.focus();
          }}
        >
          <div className="max-h-80 overflow-y-auto">
            <ul aria-label="Cities">
              {!text && (
                <li>
                  <SearchOption
                    icon={LocateFixed}
                    title="Use my current location"
                    detail={
                      locateFailed
                        ? "Your location could not be read."
                        : undefined
                    }
                    onClick={locate}
                  />
                </li>
              )}
              {matching.map(({ slug, label, detail, icon }) => (
                <li key={slug ?? "anywhere"}>
                  <SearchOption
                    icon={icon}
                    title={label}
                    detail={detail}
                    aria-pressed={Boolean(city) && slug === city?.slug}
                    onClick={() => choose({ location: slug })}
                  />
                </li>
              ))}
            </ul>
            {lookUp && apiKey && (
              <>
                <PlaceSuggestions
                  apiKey={apiKey}
                  input={text}
                  onPick={(place) => chooseWhenFound(place)}
                />
                <p className="px-2 pt-2 text-right text-caption text-muted">
                  Powered by Google
                </p>
              </>
            )}
            {!lookUp && matching.length === 0 && (
              <p role="status" className="p-2 text-sm text-muted">
                No city matches.
                {apiKey && " Keep typing to search addresses."}
              </p>
            )}
          </div>
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
