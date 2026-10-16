import { unsplash } from "@/shared/lib/unsplash";
import type { ImageVariant } from "@/shared/ui/atoms/ResponsiveImage";
import { citySlug, type City } from "./cities";

/** Hand-picked Unsplash photos of busy rental markets, by city slug. A city not here has none. */
const CITY_PHOTOS: Record<string, string> = {
  "atlanta-ga": "1663601460253-aba72eea6edf",
  "austin-tx": "1530089711124-9ca31fb9e863",
  "boston-ma": "1565127803082-69dd82351360",
  "chicago-il": "1477959858617-67f85cf4f1df",
  "dallas-tx": "1621904878414-d4ca4756bd7e",
  "denver-co": "1648441095877-90406e6ba04d",
  "fort-lauderdale-fl": "1691423332423-f2132628ff72",
  "honolulu-hi": "1779636813904-7900421432f6",
  "las-vegas-nv": "1605833556294-ea5c7a74f57d",
  "los-angeles-ca": "1757386117831-d4e9bc583076",
  "miami-fl": "1717940749812-c202bec41ee5",
  "nashville-tn": "1606762903097-713bf356b8c2",
  "new-york-ny": "1485871981521-5b1fd3805eee",
  "orlando-fl": "1609184889233-eff6dd93def4",
  "phoenix-az": "1706403222567-06fe8d8dc93e",
  "san-diego-ca": "1634312944845-72e0075cf500",
  "san-francisco-ca": "1501594907352-04cda38ebc29",
  "seattle-wa": "1502175353174-a7a70e73b362",
  "tampa-fl": "1561063139-e183e66909c4",
};

/** The city's photo at the given widths and shape, or undefined when it has none. */
export function cityPhoto(
  place: Pick<City, "city" | "state">,
  widths: number[],
  aspect: number,
): ImageVariant[] | undefined {
  const id = CITY_PHOTOS[citySlug(place)];
  return id ? unsplash(id, widths, aspect) : undefined;
}
