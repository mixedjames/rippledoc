# view-editor — AI Context Reference

## What is RippleDoc?

See [`packages/presentation4/CLAUDE.md`](../presentation4/CLAUDE.md) for the full product context. In brief: RippleDoc is a FOSS framework for scrollytelling educational presentations.

## What is view-editor?

`view-editor` is the interactive DOM renderer for a `presentation4` presentation in an editing context. It implements the `p4.PresentationView` contract and layers on top:

- **Selection chrome** — a `selected` CSS class toggled on element/section divs
- **Pointer picking** — `element:picked` / `section:picked` events for click-to-select
- **Keyboard forwarding** — `key:down` / `key:up` events while the viewport has focus
- **View modes** — `editor`, `player`, `anchors` — surfaced as `data-mode` on the viewport
- **Pin animation** — the non-scrolling clone technique that makes pinned elements appear sticky

It does not implement selection policy. Callers decide what picking means (set vs. add vs. ignore).

## Architecture

**Read [`architecture/architecture.md`](architecture/architecture.md) first.** It describes the controller/view split, the layered DOM structure, the mode mechanism, and how circular dependencies are avoided.

Also see:

- [`architecture/usage.md`](architecture/usage.md) — entry point, event table, and usage patterns
- [`architecture/selection-model.md`](architecture/selection-model.md) — mutual exclusivity, who mutates, chrome self-subscription, event semantics

### Import boundaries

Two layers with a hard import direction:

- **`clientAPI/`** — pure interfaces for package consumers. Exported from the package root.
- **`viewCore/`** — concrete classes. Never imported directly by consumers.

`viewCore/` imports `clientAPI/`. `clientAPI/` never imports `viewCore/`. The controller (`EditorViewControllerImpl`) references the view only through the local `AttachedView` structural interface to prevent a circular import.

## Public Interface Changes

Changes to anything in `clientAPI/` — adding, removing, or modifying types, interfaces, or function signatures — are **breaking changes**. Do not make them without explicit approval from the user, even if the change seems like a natural fix or unblocking move. Propose the change and the rationale first, then wait for a go-ahead before touching the interface.

## Coding Style

Shared with `presentation4` and `editor-component`. See the root [`eslint.config.mjs`](../../eslint.config.mjs) for what's enforced automatically:

- **Private class properties end in a trailing underscore** (`this.owner_`, `this.emitter_`) — ESLint enforces this
- **camelCase** for all variables, methods, and properties
- **Prettier** is authoritative for formatting — run `npm run format`
- Max nesting depth: 3. Max params per function: 3 (warn). Magic numbers are errors (exceptions: 0, 1, 2, 100, 255)
- Interfaces for public contracts; no `Core*` prefix (unlike `presentation4`)

## Dev Workflow

`view-editor` has no standalone dev harness — use `p4-build-env` or `editor-build-env`.

Run from the repo root:

```sh
npm run watch:tsc
```

Then open the relevant harness with a live server.

## Test

```sh
# Run from repo root
npm test
```

Uses **Vitest** with **happy-dom**. Tests live in `src/viewCore/tests/`. They use the real p4 model and real DOM to verify that controller operations produce correct DOM state (mode attributes, selection CSS classes, pre-attach replay).

## Lint & Format

```sh
npm run lint          # ESLint (packages only)
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```
