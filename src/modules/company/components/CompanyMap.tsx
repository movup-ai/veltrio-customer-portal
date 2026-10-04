import { MapPin } from "lucide-react";
import { mapEmbedSrc } from "../company.utils";

interface CompanyMapProps {
  /** The company's address as it wrote it. */
  address: string;
}

/** The company's address above a map of it. */
export function CompanyMap({ address }: CompanyMapProps) {
  return (
    <div>
      <p className="mb-4 flex gap-2">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        {address}
      </p>
      <iframe
        src={mapEmbedSrc(address)}
        title={`Map of ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-96 w-full rounded-xl border border-border bg-surface-muted"
      />
    </div>
  );
}
