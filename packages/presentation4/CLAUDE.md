# presentation4 — AI Context Reference

## What is RippleDoc?

RippleDoc is a framework for building **scrollytelling educational presentations**. Presentations are experienced by vertically scrolling through content, with animations triggered by scroll position. Key principles:

- FOSS — free as in speech and beer
- Author retains full ownership of content (stored as plain HTML/XML, not tied to proprietary storage)
- Presentations are self-contained: exportable as a single HTML file including all code and resources

## What is presentation4?

`presentation4` is the next foundational iteration of the RippleDoc package. It is intended to become the foundation for a GUI editor for RippleDoc, so anchor inspectability and graphical editing support are first-class concerns.

**Read [architecture.md](architecture.md) first.** It describes the three-layer design, source tree layout, document hierarchy, anchor system, view lifecycle, and design principles. This file focuses on practical context for working in the codebase.

## Architecture Summary

Three layers with deliberate import boundaries:

- **`clientAPI/`** — pure interfaces for package consumers. Exported from package root.
- **`viewAPI/`** — view bridge interfaces (re-exports clientAPI + adds view seam). Import via `@rippledoc/presentation4/viewAPI`.
- **`core/`** — concrete `Core*` classes. Never exported from the package root.
- **`anchors/`** — standalone geometry subsystem used by all layers.

## Public Interface Changes

Changes to anything in `clientAPI/`, `viewAPI/`, or `anchors/` — adding, removing,
or modifying types, interfaces, or function signatures — are **breaking changes**.
Do not make them without explicit approval from the user, even if the change seems
like a natural fix or improvement. Propose the change and the rationale first, then
wait for a go-ahead before touching the interface.

This applies especially to the anchor system (`Anchor`, `AnchorExpression`,
`XYAnchors`): these types have precise architectural meanings and their relationships
must not be altered as a side effect of fixing a bug or unblocking a demo.

## Coding Style

- **camelCase** for variables, methods, and properties
- **Prettier** is authoritative for formatting (run `npm run format`)
- **Private variables end in an underscore** (e.g. `this.sections_`)
- Interfaces for public contracts; **`Core*` prefix** for concrete implementations (e.g. `CorePresentation`, `CoreSection`)
- No nulls in the public API — see architecture.md for how optionality is handled
- Geometry is accessed via an `anchors` bag (`element.anchors.left`), not flat properties

## Dev Workflow

Run these from the repo root (two terminals):

```sh
# Terminal 1 — TypeScript compiler in watch mode
npm run watch:tsc

# Terminal 2 — Webpack for the p4 dev harness
npm run watch:p4-build-env
```

Then open `apps/p4-build-env/dist/index.html` with a live server (e.g. VSCode Live Server).

## Build

```sh
npm run build:p4-build-env
```

## Test

```sh
# Run from repo root
npm test
```

Uses **Vitest**. Tests live alongside source files or in `__tests__` directories within each package.

## Lint & Format

```sh
npm run lint          # ESLint (packages only)
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```
