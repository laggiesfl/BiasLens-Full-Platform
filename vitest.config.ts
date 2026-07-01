import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Test runner config. Tests live next to the code in `src/lib/__tests__`.
 * The `@` alias mirrors tsconfig so tests import modules the same way the app does.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
