import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true, // allow describe(), it(), expect() without import
    environment: "happy-dom", // browser-like DOM
    root: path.resolve(__dirname, "packages"), // optional: root for test discovery
    include: ["**/*.test.ts"], // pattern for test files
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@rippledoc/sanitizer": path.resolve(__dirname, "packages/sanitizer/src"),
      "@rippledoc/markdown": path.resolve(__dirname, "packages/markdown/src"),
      "@rippledoc/presentation4": path.resolve(
        __dirname,
        "packages/presentation4/src",
      ),
      "@rippledoc/presentation4/viewAPI": path.resolve(
        __dirname,
        "packages/presentation4/src/viewAPI",
      ),
      "@rippledoc/view-editor": path.resolve(
        __dirname,
        "packages/view-editor/src",
      ),
      "@rippledoc/editor-component": path.resolve(
        __dirname,
        "packages/editor-component/src",
      ),
    },
  },
});
