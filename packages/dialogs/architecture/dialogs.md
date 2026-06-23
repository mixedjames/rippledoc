# dialogs — Individual Dialogs

## Global Styles

**Purpose:** Edit the presentation-wide style defaults — the base styles that all elements and sections inherit from before named styles or own styles are applied.

**Reads:** `p4.Presentation` global style properties.

**Commits:** Mutates global styles on the presentation directly. The change is wrapped in an `OperationSink` operation so it participates in undo/redo.

**Result:** `Promise<DialogResult<void>>` — the dialog applies changes incrementally as the user edits (live preview), so there is no discrete result value. The `committed` flag tells the caller whether the user confirmed or cancelled.

---

## Named Styles

**Purpose:** Create, rename, edit, and delete the presentation's named styles. Named styles are reusable style definitions that elements and sections can reference by name.

**Reads:** The list of named styles on the `p4.Presentation`.

**Commits:** Each individual action (create, rename, edit property, delete) is wrapped as a discrete `OperationSink` operation so fine-grained undo is available.

**Result:** `Promise<DialogResult<void>>` — same rationale as Global Styles. Changes are applied as the user works; `committed` signals how the dialog exited.

---

## Markdown Editor

**Purpose:** Edit the raw Markdown source of a `MarkdownElement`. Not WYSIWYG — the user edits the Markdown text directly in a plain textarea.

**Reads:** `element.markdown` to pre-populate the textarea.

**Commits:** Calls `element.setMarkdown(newText)` on save, wrapped in an `OperationSink` operation so the change participates in undo/redo. Cancel discards edits.

**Result:** `Promise<DialogResult<void>>` — `committed: true` means the user saved; `committed: false` means they cancelled.

---

## Anchor Picker

**Purpose:** Let the user select an anchor by browsing the presentation's _logical_ structure rather than clicking in the canvas.

This dialog exists because some anchors have no useful visual representation. For example, `viewport-height` is a percentage-based anchor relative to the viewport — it appears in a list of logical anchors but cannot be pointed at on screen. The canvas-based picker in `view-editor` only handles anchors that correspond to visible elements.

**What it shows:** A tree or list of the presentation's logical structure — sections, elements within each section, and named/synthetic anchors (e.g. `viewport-height`, section boundaries). Each entry can be selected as an anchor.

**Reads:** `p4.Presentation` structure (sections and elements) and whatever the p4 model exposes for named/synthetic anchor types.

**Commits:** Nothing — this is a pure picker. It does not mutate the model.

**Result:** `Promise<DialogResult<p4.Anchor>>` — on commit, `value` is the chosen anchor. The caller (parent app or a command in `editor-component`) applies it to whatever property triggered the pick.

---

## Section Manager

**Purpose:** Reorder the presentation's sections by drag-and-drop. Provides a high-level view of section structure without the visual noise of the canvas.

**Reads:** The ordered list of sections from `p4.Presentation`.

**Commits:** On drop, the reorder is applied to the presentation directly and pushed to `OperationSink` as a single undoable operation. Each drag-and-drop gesture is one history entry.

**Result:** `Promise<DialogResult<void>>` — changes are committed on each drop as the user works. The `committed` flag signals how the dialog exited; all completed drops are already in history regardless.
