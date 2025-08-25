# ESLint

**Install with:**
`npm init @eslint/config`

This will install into `node_modules` and also create `eslint.config.js`.
(_Config file is JS even from TS project - seems to be simplest; TS version seems to need more dependencies_)

**Manually lint with:**
`npx eslint .` (in root dir)

**Add npm commands:**

```JSON
"scripts": {
  "lint": "eslint . --ext .ts,.tsx"
}
```

**TODO:**

- Enforce linted at Git staging
