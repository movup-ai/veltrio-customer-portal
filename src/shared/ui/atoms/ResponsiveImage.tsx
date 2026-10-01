import type { ComponentProps } from "react";

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
}

interface ResponsiveImageProps extends Omit<
  ComponentProps<"img">,
  "src" | "srcSet" | "width" | "height"
> {
  /** The same image at several widths. The browser picks the smallest one that fits `sizes`. */
  variants: ImageVariant[];
  alt: string;
  /** CSS `sizes` describing how wide the image renders, e.g. "(min-width: 1024px) 25vw, 80vw". */
  sizes: string;
  /** Set for the image most likely to be the largest above the fold. */
  priority?: boolean;
}

/**
 * Plain <img> with srcset. The API already stores each photo at several sizes,
 * so the browser chooses one instead of re-optimising through next/image.
 */
export function ResponsiveImage({
  variants,
  alt,
  sizes,
  priority,
  ...props
}: ResponsiveImageProps) {
  const sorted = [...variants].sort((a, b) => a.width - b.width);
  const largest = sorted.at(-1);
  if (!largest) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={largest.url}
      srcSet={sorted.map((v) => `${v.url} ${v.width}w`).join(", ")}
      sizes={sizes}
      width={largest.width}
      height={largest.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      {...props}
    />
  );
}
