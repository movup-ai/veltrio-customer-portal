import { Star } from "lucide-react";

interface CompanyStatsProps {
  tripCount: number;
  /** Average out of 5; null when there are no reviews yet. */
  rating: number | null;
  reviewCount: number;
  vehicleCount: number;
  locationCount: number;
}

const count = new Intl.NumberFormat("en-US");

/** Headline numbers for a company, on its brand colour. */
export function CompanyStats({
  tripCount,
  rating,
  reviewCount,
  vehicleCount,
  locationCount,
}: CompanyStatsProps) {
  const stats = [
    { label: "Trips completed", value: count.format(tripCount) },
    {
      label:
        rating === null
          ? "No reviews yet"
          : `Rating from ${count.format(reviewCount)} reviews`,
      value: rating === null ? "–" : rating.toFixed(1),
      star: rating !== null,
    },
    {
      label: vehicleCount === 1 ? "Vehicle" : "Vehicles",
      value: count.format(vehicleCount),
    },
    {
      label: locationCount === 1 ? "Pick-up location" : "Pick-up locations",
      value: count.format(locationCount),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-on-primary/15 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col-reverse bg-primary p-6 text-on-primary md:p-8"
        >
          <dt className="mt-2 text-sm opacity-85">{stat.label}</dt>
          <dd className="flex items-center gap-2 font-display text-h2 md:text-h1">
            {stat.value}
            {stat.star && (
              <Star aria-hidden className="size-6 fill-current md:size-7" />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
