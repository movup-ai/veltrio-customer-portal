/// <reference types="google.maps" />
"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import type { SearchPlace } from "../search-params";
import { SearchOption } from "./SearchOption";

interface PlaceSuggestionsProps {
  apiKey: string;
  /** What the renter has typed so far. */
  input: string;
  /** Given the picked place while its point is still being fetched; null when it has none. */
  onPick: (place: Promise<SearchPlace | null>) => void;
}

type Prediction = google.maps.places.PlacePrediction;

/** Pause after the last keystroke before asking, in milliseconds; each ask is billed. */
const TYPING_PAUSE = 250;

function Suggestions({ input, onPick }: Omit<PlaceSuggestionsProps, "apiKey">) {
  const places = useMapsLibrary("places");
  // One token from the first keystroke to the pick bills the whole lookup as one session.
  const session =
    useRef<google.maps.places.AutocompleteSessionToken>(undefined);
  const [result, setResult] = useState<{
    input: string;
    found: Prediction[] | null;
  }>();

  useEffect(() => {
    if (!places) return;
    let stale = false;
    const timer = setTimeout(async () => {
      session.current ??= new places.AutocompleteSessionToken();
      const found =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: session.current,
          includedRegionCodes: ["us"],
        }).then(
          ({ suggestions }) =>
            suggestions.flatMap(({ placePrediction }) => placePrediction ?? []),
          () => null,
        );
      if (!stale) setResult({ input, found });
    }, TYPING_PAUSE);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [places, input]);

  const locate = async (prediction: Prediction) => {
    const place = prediction.toPlace();
    await place.fetchFields({ fields: ["location"] });
    session.current = undefined;
    if (!place.location) return null;
    return {
      lat: place.location.lat(),
      lng: place.location.lng(),
      label: prediction.mainText?.text ?? prediction.text.text,
    };
  };

  // Suggestions for an earlier spelling are not shown against the current one.
  if (result?.input !== input) {
    return (
      <div
        role="status"
        aria-label="Looking up places"
        className="space-y-2 p-2"
      >
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
    );
  }
  if (!result.found || result.found.length === 0) {
    return (
      <p role="status" className="p-2 text-sm text-muted">
        {result.found
          ? "No places match. Try a city, ZIP code or street address."
          : "Address search is unavailable right now. Choose a city instead."}
      </p>
    );
  }
  return (
    <ul aria-label="Places">
      {result.found.map((prediction) => (
        <li key={prediction.placeId}>
          <SearchOption
            icon={MapPin}
            title={prediction.mainText?.text ?? prediction.text.text}
            detail={prediction.secondaryText?.text}
            onClick={() => onPick(locate(prediction))}
          />
        </li>
      ))}
    </ul>
  );
}

/** Places in the United States matching what was typed, from Google. */
export function PlaceSuggestions({ apiKey, ...props }: PlaceSuggestionsProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <Suggestions {...props} />
    </APIProvider>
  );
}
