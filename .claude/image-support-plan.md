# Image Support — Implementation Plan

Session context: This plan was designed before implementation started. Await user
answers to the three open questions (marked **PENDING**) before starting Area 2/3 work.

---

## Open Questions (PENDING user answers)

- [ ] **Q1** — `objectFit` on `BitmapImageElement` directly (recommended) or in `ElementStyleProps` cascade?
- [ ] **Q2** — Extend `Fill` with image variant (recommended) or add separate `backgroundImage` property to style props?
- [ ] **Q3** — `backgroundPositionX/Y` in AnimationsPanel: keep visible for all elements (current) or only when target has an image fill?

---

## Summary of API changes (all require approval before touching clientAPI/)

| Package         | Change                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `presentation4` | New `styles/ImageFit.ts`: `type ImageFit = 'cover' \| 'contain' \| 'fill' \| 'none'`                                  |
| `presentation4` | `styles/Fill.ts`: add `{ type: 'image'; src: string; fit: ImageFit }` variant (if Q2 = extend Fill)                   |
| `presentation4` | `elements/BitmapImageElement.ts`: add `objectFit: ImageFit`, `setObjectFit(fit: ImageFit): void` (if Q1 = on-element) |
| `presentation4` | `styles/index.ts`: export `ImageFit`                                                                                  |

---

## Area 1 — Fix BitmapImageElement rendering (view-editor)

**No API changes. Safe to start immediately.**

- [ ] `EditorBitmapImageElementView.ts`: create `<img>` in `contentElement`, set `src` and `alt`
- [ ] Subscribe to `element:srcChanged` event to update `src` attribute
- [ ] Subscribe to `element:altChanged` event to update `alt` attribute
- [ ] Apply `object-fit` CSS from `owner.objectFit` (once Area 2 API is approved)
- [ ] Add placeholder/error state when `src` is empty

---

## Area 2 — Image fit mode (presentation4 + view-editor)

**Requires Q1 answer and API approval.**

### presentation4 — model

- [ ] Create `src/clientAPI/styles/ImageFit.ts` with `ImageFit` union type
- [ ] Export `ImageFit` from `src/clientAPI/styles/index.ts` and `src/clientAPI/index.ts`
- [ ] Add `objectFit: ImageFit` getter and `setObjectFit(fit: ImageFit): void` to `BitmapImageElement.ts`
- [ ] Implement in `CoreBitmapImageElement.ts` (store field, emit event on change, default: `'contain'`)
- [ ] Update `BitmapImageElementMemento` in `PresentationMemento.ts` to include `objectFit`
- [ ] Update `CoreBitmapImageElement.toMemento()` and deserialization to round-trip `objectFit`

### view-editor

- [ ] Apply `object-fit` CSS to `<img>` in `EditorBitmapImageElementView` based on `owner.objectFit`
- [ ] Subscribe to `element:objectFitChanged` (or re-render on change) to keep CSS in sync

---

## Area 3 — Image as background fill (presentation4 + view-editor)

**Requires Q2 answer and API approval.**

### presentation4 — model

- [ ] Add `{ type: 'image'; src: string; fit: ImageFit }` variant to `Fill.ts` (if Q2 = extend Fill)
- [ ] Update `FillMemento` in `PresentationMemento.ts`
- [ ] Ensure the cascade resolver passes image fills through unchanged (no interpolation needed)

### view-editor — element view

- [ ] In element style application: when `fill.type === 'image'`, set:
  - `background-image: url(<src>)`
  - `background-size` mapped from `fit` (`cover`→`cover`, `contain`→`contain`, `fill`→`100% 100%`, `none`→`auto`)
  - `background-repeat: no-repeat`
  - `background-position` left to animation system (WAAPI `backgroundPositionX/Y` already handles it)
- [ ] Clear image background CSS when fill changes away from `image` type

### view-editor — section view

- [ ] Same background-image rendering for sections (same mapping)

---

## Area 4 — `importImage` command (editor-component)

**Depends on Area 1 being done. No API changes needed.**

- [ ] Implement `exec('importImage')` in `EditorComponentImpl.ts`:
  - Call `delegate.requestImageImport()`
  - If cancelled: return
  - Detect type from `src`: `.svg` extension → `SVGImageElement`, otherwise → `BitmapImageElement`
  - If a `BitmapImageElement` or `SVGImageElement` is currently selected → call `setSrc()` (wrapped in undo op)
  - If a section is selected → add new element + set src (wrapped in undo op)
  - Otherwise → no-op (or show status hint)
- [ ] Implement `canExec('importImage')`: return `true` when a section or image element is selected
- [ ] Add `'importImage'` to `EditorCommandId` if not already there (check `EditorCommands.ts`)
- [ ] Fire `commandStateChanged` when selection changes so shell toolbar can enable/disable

---

## Area 5 — PropertiesPanel UI (editor-component)

**Depends on Area 2 API being approved.**

- [ ] **BitmapImageElement selected:**
  - Show "Image element" type label
  - "Change source…" button → `delegate.requestImageImport()` → `setSrc()` + undo op
  - `objectFit` dropdown (Cover / Contain / Fill / None) → `setObjectFit()` + undo op
  - Alt text input field → `setAlt()` + undo op (with blur-commit pattern)
- [ ] **SVGImageElement selected:**
  - Show "SVG image" type label
  - "Change source…" button → `delegate.requestImageImport()` → filter `.svg` only or allow any

---

## Area 6 — StylesPanel image fill UI (editor-component)

**Depends on Area 3 API being approved.**

- [ ] Add `image` option to Fill type dropdown (alongside None / Solid)
- [ ] When `fill.type === 'image'`, show:
  - "Choose image…" button → `delegate.requestImageImport()` → set fill + undo op
  - Truncated `src` display (read-only)
  - `fit` dropdown (Cover / Contain / Fill / None) → update fill + undo op
- [ ] Applies to both element fill and section fill renderers in `StylesPanel.ts`
- [ ] Update consensus helpers to handle `'image'` fill type (fillsEqual, consensusFill)

---

## Area 7 — Path normalization (shell — editor-build-env and Electron)

**No editor-component or dialogs changes. Shell responsibility.**

- [ ] `editor-build-env` (`apps/editor-build-env/src/ts/main.ts`):
  - Wire `requestImageImport()` to `<input type="file">`
  - Return `URL.createObjectURL(file)` (blob URL — fine for harness, not portable)
  - No path warning needed in browser harness
- [ ] Future Electron shell (when built):
  - Use `dialog.showOpenDialog()` for native file picker
  - Compute path relative to presentation file location (if in same dir/subdir)
  - Warn user (native `dialog.showMessageBox`) if path is outside and will be absolute
  - Return relative path string or absolute path with warning

---

## Area 8 — Animation (mostly already done)

**Verify, then close out.**

- [ ] Confirm `transform: [{ type: 'scale', x, y }]` animates BitmapImageElement correctly once Area 1 is done (should work — WAAPI applies to the element container div)
- [ ] Confirm `transform: [{ type: 'translate', x, y }]` animates position correctly
- [ ] Confirm `backgroundPositionX/Y` keyframes work for sections/elements with image fill once Area 3 is done
- [ ] **Decide on Q3**: optionally hide `backgroundPositionX/Y` fields in AnimationsPanel when no image fill is set (deferred cosmetic; not blocking)

---

## Implementation order

```
Area 1  (no deps, no API changes)
  └─ Area 4  (depends on Area 1)
       └─ harness wiring (Area 7 browser part)

Area 2 API approval
  └─ Area 2 implementation
       └─ Area 5 PropertiesPanel

Area 3 API approval  (can run in parallel with Area 2)
  └─ Area 3 implementation
       └─ Area 6 StylesPanel

Area 8 verification  (after Area 1 + Area 3)
```

---

## Files touched (expected)

| File                                                                               | Areas   |
| ---------------------------------------------------------------------------------- | ------- |
| `packages/presentation4/src/clientAPI/styles/ImageFit.ts`                          | 2 (new) |
| `packages/presentation4/src/clientAPI/styles/Fill.ts`                              | 3       |
| `packages/presentation4/src/clientAPI/styles/index.ts`                             | 2       |
| `packages/presentation4/src/clientAPI/index.ts`                                    | 2       |
| `packages/presentation4/src/clientAPI/elements/BitmapImageElement.ts`              | 2       |
| `packages/presentation4/src/clientAPI/serialize/PresentationMemento.ts`            | 2, 3    |
| `packages/presentation4/src/core/elements/CoreBitmapImageElement.ts`               | 2       |
| `packages/view-editor/src/viewCore/views/elements/EditorBitmapImageElementView.ts` | 1, 2    |
| `packages/view-editor/src/viewCore/views/EditorSectionView.ts`                     | 3       |
| `packages/view-editor/src/viewCore/views/elements/EditorElementView.ts`            | 3       |
| `packages/editor-component/src/core/EditorComponentImpl.ts`                        | 4       |
| `packages/editor-component/src/clientAPI/EditorCommands.ts`                        | 4       |
| `packages/editor-component/src/core/ui/panels/PropertiesPanel.ts`                  | 5       |
| `packages/editor-component/src/core/ui/panels/StylesPanel.ts`                      | 6       |
| `apps/editor-build-env/src/ts/main.ts`                                             | 7       |
