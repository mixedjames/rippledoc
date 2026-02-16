import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  /**
   * We ignore:
   * - Files we don't own (e.g. node_modules)
   * - Build output (e.g. dist, build)
   * - Test files (e.g. *.test.ts)
   * - Documentation output (e.g. docs)
   *
   * FIXME: In the future we should probably test the tests too.
   */
  {
    ignores: [
      "node_modules",
      "apps",
      "**/dist/**",
      "**/docs/**",
      "**/build/**",
      "**/*.test.ts",
    ],
  },

  // ***********************************************************************************************
  // Thar be custom rules... (and it's not even talk-like-a-pirate day yet!)
  // ***********************************************************************************************

  /**
   * (1) Enable use of per-project tsconfig.json files for type-aware linting. This allows us to
   *     have different tsconfig.json files for different packages
   * 
   * Is this important? Good question, but I enabled it when I initially got ESLint working and
   * haven't had any issues with it, so I'm leaving it in for now.
   * 
   * See [Relative TSConfig Projects with parserOptions.project = true
](https://typescript-eslint.io/blog/parser-options-project-true/)
   */
  {
    files: ["packages/*/src/**/*.ts", "packages/*/src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true, // use tsconfig.json
      },
    },
  },

  /**
   * (2) Enforce naming conventions for private class properties and parameter properties.
   *     Private properties must use camelCase and have a trailing underscore.
   *
   * FIXME: not sure how the TS community feels about this. I've nicked it from my C++ practice
   * where the convention is common and very useful. I initially didn't do it because I thought
   * explicit this would be enough, but given we use getters its easy to accidentally shadow a
   * private property. Trailing underscore was a low-cost way to avoid this.
   */
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

  {
    rules: {
      /**
       * Enforce a maximum cyclomatic complexity of 20.
       *
       * 20 is the default. It might be a bit high. However, I'm not totally sure how much benefit
       * we get from this rule. I've turned it on to ward about the most egregious offenders.
       */
      complexity: ["warn", 20],

      /**
       * Enforce a maximum nesting depth of 3.
       */
      "max-depth": ["error", 3],

      /**
       * Enforce a maximum of 3 parameters per function.
       */
      "max-params": ["warn", 3],

      /**
       * Magic numbers are errors.
       *
       * I'm not totally averse to adding more here, but by default we should bomb to prompt us to
       * think. A single-line disable instruction check is probably better in general.
       *
       * Exceptions:
       *   0 and 1
       *   2 (division by 2 is common for centering things)
       * 255 (because of RGBA color parsing)
       */
      "no-magic-numbers": ["error", { ignore: [0, 1, 2, 255] }],
    },
  },

  // ***********************************************************************************************
  // Standard rules
  // ***********************************************************************************************

  /**
   * Recommended ESLint rules for JavaScript and TypeScript.
   */
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  //...tseslint.configs.strictTypeChecked,

  /**
   * Prettier is in charge of formatting - end of
   *
   * ESLint mustn't get in the way. My understanding is that this has to come after the recommended
   * configs so that it can override any formatting rules they set.
   */
  prettier,
];
