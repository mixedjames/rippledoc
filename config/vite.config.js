// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/", // where index.html lives
  build: {
    outDir: "../public", // adjust relative to root
    emptyOutDir: true,
  },

  test: {
    // Pick up any .test.ts, .test.js, .spec.ts, or .spec.js file in any folder
    include: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}'],

    // Optional: run tests in Node environment
    environment: 'node',

    // Optional: show console.log in output
    globals: true,
  },
});
