// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Base JS rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
    ...js.configs.recommended,
    rules: {
      eqeqeq: "error",
      curly: "error",
      "array-callback-return": ["error", { checkForEach: true }],
    },
  },

  // TypeScript rules
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
    ...tseslint.configs.recommended[0], // parser + TS-aware setup
    rules: {
      eqeqeq: "error",
      curly: "error",
      "array-callback-return": ["error", { checkForEach: true }],
    },
  },
]);
