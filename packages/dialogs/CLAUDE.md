# dialogs — AI Context Reference

## What is RippleDoc?

See [`packages/presentation4/CLAUDE.md`](../presentation4/CLAUDE.md) for the full product context. In brief: RippleDoc is a FOSS framework for scrollytelling educational presentations.

## What is dialogs?

`dialogs` provides modal dialog UI for the RippleDoc editor. It is not consumed by `editor-component` directly — both are consumed by a parent app package that wires them together with host-specific shell code to form a complete editing application.

The package has two responsibilities:

1. **Infrastructure** — a reusable mechanism for mounting and displaying modal dialogs in the DOM.
2. **Dialog implementations** — editor dialogs built on that infrastructure.

See [`architecture/architecture.md`](architecture/architecture.md) for the full design.

## Dialogs

| Dialog | Purpose |
|---|---|
| Global styles | Edit presentation-wide style defaults |
| Named styles | Create, edit, and delete the presentation's named styles |
| Anchor picker | Browse the presentation's logical structure to select an anchor |
| Section manager | Reorder sections by drag-and-drop |

## Architecture

```
src/
  clientAPI/   ← stable public surface; what the parent app imports
  core/        ← internals; never imported directly by consumers
```

`core/` imports `clientAPI/`. `clientAPI/` never imports `core/`.

## Public Interface Changes

Changes to anything in `clientAPI/` are **breaking changes**. Do not make them without explicit approval from the user. Propose the change and the rationale first, then wait for a go-ahead before touching the interface.

## Undo/Redo Cooperation

Dialogs that mutate the `presentation4` model must cooperate with `editor-component`'s undo/redo history. Since these packages are decoupled, they cooperate through an `OperationSink` interface defined in this package's `clientAPI/`. The parent app provides an implementation that bridges to `editor-component`. See [`architecture/architecture.md`](architecture/architecture.md) for the design.

## Coding Conventions

Shared with `presentation4`, `view-editor`, and `editor-component`. See the root [`eslint.config.mjs`](../../eslint.config.mjs) for what's enforced automatically:

- **Private class properties end in a trailing underscore** (`this.host_`, `this.emitter_`) — ESLint enforces this
- **camelCase** for all variables, methods, and properties
- **Prettier** is authoritative for formatting — run `npm run format`
- Max nesting depth: 3. Max params per function: 3 (warn). Magic numbers are errors (exceptions: 0, 1, 2, 100, 255)
- Interfaces for public contracts; no `Core*` prefix

## Dev Workflow

No standalone dev harness yet. Run from the repo root:

```sh
npm run watch:tsc
```

## Lint & Format

```sh
npm run lint          # ESLint (packages only)
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```
