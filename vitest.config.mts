import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // next-intl imports "next/server" the way a bundler resolves it, so it is bundled here too.
    server: { deps: { inline: ["next-intl"] } },
  },
});
