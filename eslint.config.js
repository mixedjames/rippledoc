import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      "apps",
      "**/dist/**",
      "**/docs/**",
      "**/build/**",
      "**/*.test.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier, // disables formatting rules that conflict with Prettier
  {
    files: ["packages/*/src/**/*.ts", "packages/*/src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true, // use tsconfig.json
      },
    },
  },
  {
    files: ["packages/*/src/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["classProperty", "parameterProperty"],
          modifiers: ["private"],
          format: ["camelCase"],
          trailingUnderscore: "require",
        },
      ],
    },
  },
];
