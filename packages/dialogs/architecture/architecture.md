# dialogs — Architecture

## Overview

`dialogs` is a sibling package to `editor-component`. Neither depends on the other. A parent app package wires both together with host-specific shell code.

The package is split into two layers:

- **`clientAPI/`** — pure interfaces and types; the public surface for the parent app.
- **`core/`** — concrete implementations; never imported directly by consumers.

## Dialog Infrastructure

The infrastructure provides a `DialogHost` — a class that owns a DOM overlay (a backdrop element appended to a mount point) and renders dialog content into it. One dialog is shown at a time.

Each dialog call:

1. Constructs the dialog's DOM content.
2. Mounts it inside the overlay via `DialogHost`.
3. Returns a `Promise<DialogResult<T>>` that resolves when the user commits or cancels.

The host manages focus trapping and Escape handling so individual dialogs don't have to.

### DialogResult

All dialogs resolve with a `DialogResult<T>` — a boolean-discriminated union defined in `clientAPI/`:

```ts
type DialogResult<T> = { committed: true; value: T } | { committed: false };
```

- **Commit**: `{ committed: true, value: T }` — the result value is present and typed.
- **Cancel** (Escape, backdrop click, explicit cancel button): `{ committed: false }` — no value.

Dialogs with no result value use `DialogResult<void>`. Callers check `committed` and ignore `value`.

## Undo/Redo Cooperation

Dialogs that mutate the `presentation4` model must integrate with `editor-component`'s undo/redo history. Since the two packages are decoupled, they cooperate through an `OperationSink` interface defined in `dialogs`'s `clientAPI/`:

```ts
interface OperationSink {
  push(operation: { execute(): void; undo(): void }): void;
}
```

The parent app provides an implementation that delegates to `editor-component`'s internal history. When a dialog commits a change:

1. It wraps the mutation in an `{ execute, undo }` object.
2. It calls `execute()` immediately to apply the change.
3. It passes the operation to the `OperationSink` so the editor's undo/redo stack records it.

`OperationSink` is passed to the `Dialogs` factory at construction time, not per-call, since the sink is a stable dependency. Dialogs that are read-only (e.g. an anchor picker that only returns a value) do not use the sink.

> **Note for `editor-component`:** For the parent app to bridge `OperationSink` to `editor-component`'s history, `editor-component` will need to expose a `pushOperation` method (or equivalent) in its `clientAPI`. This is a small, additive clientAPI change that requires explicit approval before implementation.

## Import Boundaries

```
parent app
  ├── imports clientAPI/ from dialogs      (creates Dialogs, provides OperationSink)
  └── implements OperationSink             (delegates to editor-component history)

core/ ──imports──▶ clientAPI/
clientAPI/ ──never imports──▶ core/
```

## Individual Dialogs

See [`dialogs.md`](dialogs.md) for the purpose and data contract of each dialog.
