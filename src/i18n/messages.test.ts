import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routing } from "./routing";

const ROOT = "messages";

/** Every key of a messages file, as dotted paths. */
function keys(value: unknown, path = ""): string[] {
  if (typeof value !== "object" || value === null) return [path];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, path ? `${path}.${key}` : key),
  );
}

const read = (locale: string, file: string) =>
  keys(JSON.parse(readFileSync(`${ROOT}/${locale}/${file}`, "utf8"))).sort();

describe("messages", () => {
  const files = readdirSync(`${ROOT}/${routing.defaultLocale}`);

  it.each(routing.locales)(
    "%s has every file and key English has",
    (locale) => {
      expect(readdirSync(`${ROOT}/${locale}`)).toEqual(files);
      for (const file of files) {
        expect(read(locale, file), file).toEqual(
          read(routing.defaultLocale, file),
        );
      }
    },
  );
});
