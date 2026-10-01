/** Scroll behavior for programmatic scrolling that honours reduced-motion. Browser only. */
export function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
