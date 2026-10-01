import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Keep in sync with the token names in src/styles/globals.css so that
// e.g. `text-h2` (size) and `text-muted` (color) are not merged away.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "label",
        "caption",
        "meta",
        "sm",
        "body",
        "ui",
        "lead",
        "h4",
        "h3",
        "h2",
        "h1",
        "display",
      ],
      shadow: ["1", "2", "3", "search"],
      radius: ["sm", "md", "lg", "xl"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
