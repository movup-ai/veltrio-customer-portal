import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";

const IMPORT = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
const USED = /useTranslations\(\s*"([a-zA-Z]+)/g;
const DECLARED = /namespaces=\{\[([^\]]*)\]\}/g;

function resolve(specifier: string, from: string): string | undefined {
  const base = specifier.startsWith("@/")
    ? join("src", specifier.slice(2))
    : specifier.startsWith(".")
      ? join(dirname(from), specifier)
      : undefined;
  if (!base) return undefined;
  return [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")]
    .map(normalize)
    .find((candidate) => existsSync(candidate));
}

/** The message files read by client components reachable from a route file. */
function clientNamespaces(entry: string): string[] {
  const seen = new Set<string>();
  const found = new Set<string>();
  const queue: [string, boolean][] = [[normalize(entry), false]];
  while (queue.length) {
    const [file, inClient] = queue.pop()!;
    const source = readFileSync(file, "utf8");
    const client = inClient || source.trimStart().startsWith('"use client"');
    if (seen.has(`${file}:${client}`)) continue;
    seen.add(`${file}:${client}`);
    if (client) {
      for (const match of source.matchAll(USED)) found.add(match[1]!);
    }
    for (const match of source.matchAll(IMPORT)) {
      const next = resolve(match[1]!, file);
      if (next) queue.push([next, client]);
    }
  }
  found.delete("common");
  return [...found].sort();
}

function declaredNamespaces(file: string): string[] {
  const lists = [...readFileSync(file, "utf8").matchAll(DECLARED)];
  return lists.flatMap((match) => match[1]!.match(/[a-z]+/gi) ?? []);
}

describe("ClientMessages", () => {
  const routeFiles = globSync("src/app/**/*.tsx");

  it.each(routeFiles)("%s sends the messages its client parts read", (file) => {
    expect(declaredNamespaces(file)).toEqual(
      expect.arrayContaining(clientNamespaces(file)),
    );
  });
});
