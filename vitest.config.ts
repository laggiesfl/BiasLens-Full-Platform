import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Test runner config. The @ alias mirrors tsconfig so tests import modules
 * the same way the app does. server-only is replaced with an empty test stub
 * so server helpers can be unit-tested without weakening their Next.js boundary.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/lib/enquiries/server-only.test-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
