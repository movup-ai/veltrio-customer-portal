import { cn } from "@/shared/lib/cn";

interface FlagProps {
  /** A flag drawn in public/images/flags. */
  country: "us" | "es";
  className?: string;
}

/** A round country flag, shown small beside a language or region name. */
export function Flag({ country, className }: FlagProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/flags/${country}.svg`}
      alt=""
      width={20}
      height={20}
      className={cn("size-5 shrink-0 rounded-full", className)}
    />
  );
}
