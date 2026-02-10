import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,          // allow describe(), it(), expect() without import
    environment: "happy-dom", // browser-like DOM
    //root: path.resolve(__dirname, "apps"), // optional: root for test discovery
    include: ["**/*.test.ts"], // pattern for test files
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "packages/core/src"),
      "@expressions": path.resolve(__dirname, "packages/expressions/src"),
      "@presentation": path.resolve(__dirname, "packages/presentation/src"),
      "@htmlPresentationView": path.resolve(__dirname, "packages/htmlPresentationView/src")
    },
  },
});
