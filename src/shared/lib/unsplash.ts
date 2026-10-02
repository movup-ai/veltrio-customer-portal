import type { ImageVariant } from "@/shared/ui/atoms/ResponsiveImage";

/** Placeholder photography: one Unsplash photo at several widths. */
export function unsplash(
  id: string,
  widths: number[],
  aspect: number,
): ImageVariant[] {
  return widths.map((width) => {
    const height = Math.round(width / aspect);
    return {
      width,
      height,
      url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${width}&h=${height}`,
    };
  });
}
