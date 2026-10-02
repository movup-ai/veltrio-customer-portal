const HEX = /^#?([0-9a-f]{6})$/i;

/** Relative luminance (WCAG) of a "#rrggbb" colour; null when it is not one. */
function luminance(hex: string) {
  const match = HEX.exec(hex);
  if (!match?.[1]) return null;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const channel = parseInt(match[1]!.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Whether white or near-black text reads better on a background colour. */
export function readableOn(
  background: string,
  light = "#ffffff",
  dark = "#0f1012",
) {
  const value = luminance(background);
  // 0.179 is where contrast against white and against black is equal.
  return value !== null && value > 0.179 ? dark : light;
}

/** Guards a colour that comes from data before it reaches inline CSS. */
export function isHexColor(value: string | null | undefined): value is string {
  return !!value && HEX.test(value);
}
