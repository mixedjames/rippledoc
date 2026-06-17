# editor-component — AI Context Reference

## What is RippleDoc?

See [`packages/presentation4/CLAUDE.md`](../presentation4/CLAUDE.md) for the full product context. In brief: RippleDoc is a FOSS framework for scrollytelling educational presentations, and this editor is the GUI being built on top of `presentation4`.

## What is editor-component?

`editor-component` is a **portable, framework-agnostic editor UI component**. It wraps:

- `@rippledoc/presentation4` — the data model and domain logic
- `@rippledoc/view-editor` — the interactive rendering layer

It exposes a clean imperative API to a host **shell** (the app that mounts it). The shell may be an Electron desktop app or a browser web app. The current dev harness is `apps/editor-build-env`.

## Package Structure

```
src/
  clientAPI/   ← stable public surface; what shells import
  core/        ← internals; never imported by shells directly
  createEditorComponent.ts  ← single factory entry point
```

### clientAPI/

| File                 | Role                                                 |
| -------------------- | ---------------------------------------------------- |
| `EditorComponent.ts` | Main interface the shell interacts with              |
| `EditorCommands.ts`  | `EditorCommandId` and `EditorToolId` string unions   |
| `EditorEvents.ts`    | Events the editor fires at the shell                 |
| `EditorDelegate.ts`  | Callbacks the shell provides for OS-level operations |

### core/

| File / dir               | Role                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| `EditorComponentImpl.ts` | Implements `EditorComponent`; coordinates all subsystems            |
| `EditorState.ts`         | Mutable shared state bag passed to tools                            |
| `TypedEmitter.ts`        | Generic typed event emitter                                         |
| `ui/EditorLayout.ts`     | Creates and owns top-level DOM structure                            |
| `tools/`                 | Active-tool abstraction; each tool handles view events while active |
| `history/`               | `EditOperation` interface + `OperationHistory` (undo/redo stacks)   |

## Key Design Patterns

### Delegate (shell → editor, OS operations)

The shell implements `EditorDelegate` and passes it to `createEditorComponent`. This keeps file I/O, native text editing, and confirm dialogs out of the component and easy to stub in tests.

```ts
interface EditorDelegate {
  requestImageImport(): Promise<{ src: string } | null>;
  requestTextEdit(current: string): Promise<string | null>;
  requestConfirm(message: string): Promise<boolean>;
}
```

### Commands (shell → editor, editing actions)

All editing actions go through `exec(command)` / `canExec(command)`. The shell re-queries `canExec` whenever the editor fires `commandStateChanged`.

### Events (editor → shell)

Four events: `toolChanged`, `selectionChanged`, `dirty`, `commandStateChanged`. Subscriptions return an unsubscribe function.

### Active Tool

One tool is active at a time. Tools receive an `EditorToolContext` (view events, selection controller, shared state, `pushOperation`) and subscribe/unsubscribe in `activate`/`deactivate`. New tools implement `EditorTool` and are wired into `EditorComponentImpl.createTool_`.

### History

`EditOperation` (execute + undo). `OperationHistory` maintains undo/redo stacks. Tools push operations via `context.pushOperation`; `exec("undo")` / `exec("redo")` drive it.

## UI Ownership

**This package owns:** An editor sidebar containing tool panels (anchor editing, style controls, etc.) — sidebar is not yet built.

**Shell owns:** Global controls — new / save / load / undo / redo toolbar — and delegated operations like editing global styles.

## Command Status

| Command                                  | Status                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| `undo` / `redo`                          | Done                                                     |
| `tool:singleSelect` / `tool:multiSelect` | Done                                                     |
| `addSection`                             | Not yet implemented                                      |
| `deleteSelected`                         | Not yet implemented                                      |
| `importImage`                            | Not yet implemented — uses `delegate.requestImageImport` |
| `editText`                               | Not yet implemented — uses `delegate.requestTextEdit`    |
| `loadPresentation`                       | Stub — throws                                            |

## Public Interface Changes

Changes to anything in `clientAPI/` — adding, removing, or modifying types, interfaces, or function signatures — are **breaking changes**. Do not make them without explicit approval from the user, even if the change seems like a natural fix or unblocking move. Propose the change and the rationale first, then wait for a go-ahead before touching the interface.

## Coding Conventions

Shared with `presentation4` and `view-editor`. See the root [`eslint.config.mjs`](../../eslint.config.mjs) for what's enforced automatically:

- **Private class properties end in a trailing underscore** (`this.state_`, `this.history_`) — ESLint enforces this
- **camelCase** for all variables, methods, and properties
- **Prettier** is authoritative for formatting — run `npm run format`
- Max nesting depth: 3. Max params per function: 3 (warn). Magic numbers are errors (exceptions: 0, 1, 2, 100, 255)
- Interfaces for public contracts; no `Core*` prefix needed here (unlike `presentation4` where the pattern distinguishes interface from implementation across layers)

## Dev Workflow

Run these from the repo root:

```sh
# Terminal 1 — TypeScript compiler in watch mode
npm run watch:tsc

# Terminal 2 — Webpack for the editor dev harness
npm run watch:editor-build-env
```

Then open `apps/editor-build-env/dist/index.html` with a live server.

## Lint & Format

```sh
npm run lint          # ESLint (packages only)
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```
