import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true, // allow describe(), it(), expect() without import
    environment: "happy-dom", // browser-like DOM
    //root: path.resolve(__dirname, "apps"), // optional: root for test discovery
    include: ["**/*.test.ts"], // pattern for test files
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@rippledoc/expressions": path.resolve(
        __dirname,
        "packages/expressions/src",
      ),
      "@rippledoc/presentation": path.resolve(
        __dirname,
        "packages/presentation/src",
      ),
      "@rippledoc/presentationBuilder": path.resolve(
        __dirname,
        "packages/presentationBuilder/src",
      ),
      "@rippledoc/htmlPresentationView": path.resolve(
        __dirname,
        "packages/htmlPresentationView/src",
      ),
      "@rippledoc/scrollTrigger": path.resolve(
        __dirname,
        "packages/scrollTrigger/src",
      ),
    },
  },
});
