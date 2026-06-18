# Anchor Toolbox — Working Plan

## Context

We are building the anchor editing UI for the `editor-component` package.
Read `CLAUDE.md` in this package before working here, and `packages/presentation4/CLAUDE.md`
for the underlying model.

---

## How anchors work in p4

Every element and section has 6 anchors: `left`, `right`, `width`, `top`, `bottom`, `height`.

**2-of-3 rule:** On each axis, exactly two anchors are independently constrained; the third
is derived from the other two. All three are readable at all times.

**Expression types** (concrete classes exported from `@rippledoc/presentation4`):

| Class                      | Properties                      | Meaning                                               |
| -------------------------- | ------------------------------- | ----------------------------------------------------- |
| `ConstantAnchorExpression` | `.value`                        | Fixed number                                          |
| `OffsetAnchorExpression`   | `.offset`, `.dependencies[0]`   | `base.value + offset`                                 |
| `FractionAnchorExpression` | `.fraction`, `.dependencies[0]` | `base.value * fraction`                               |
| `DerivedAnchorExpression`  | not exported                    | Internal derived; the "third" anchor — never user-set |

**Identification strategy:** use `instanceof` against the three exported concrete classes.
`DerivedAnchorExpression` is the "none of the above" case. Duck-typing on
`dependencies.length` is not contractual.

The three classes are re-exported from `packages/presentation4/src/index.ts`:

```ts
export { ConstantAnchorExpression } from "./anchors/expressions/ConstantAnchorExpression";
export { OffsetAnchorExpression } from "./anchors/expressions/OffsetAnchorExpression";
export { FractionAnchorExpression } from "./anchors/expressions/FractionAnchorExpression";
```

---

## Element vs section differences

**Elements** (`clientAPI/Element.ts`):

- `setHorizontalAnchors(descriptor)` — 2-of-3: left / right / width
- `setVerticalAnchors(descriptor)` — 2-of-3: top / bottom / height
- `setAutoHeight(options)` — makes height content-dependent
- All 6 anchors are user-editable in the toolbox

**Sections** (`clientAPI/Section.ts`):

- `setVerticalAnchors(descriptor)` only — 2-of-3: top / bottom / height
- **Top is system-managed** — always linked to the section above. The toolbox must
  never let the user set the top anchor. It shows as locked in the list; when top
  is the derived anchor, the swap-derived dropdown must also exclude it as an option.
- Height and bottom are freely editable.
- Sections have no horizontal anchors.
- Detect "is this a section" as `!("setHorizontalAnchors" in subject)`.

---

## Selection

`EditorSelectionController` (`view-editor/src/clientAPI/EditorSelectionController.ts`)
tracks `elements: ReadonlySet<Element>` and `sections: ReadonlySet<Section>` as
mutually exclusive sets.

Anchors are only editable when **exactly one** element or section is selected.
`AnchorsPanel` checks both sets in its `update()` method.

---

## View mode

`view-editor` has a `"anchors"` ViewMode (alongside `"editor"` and `"player"`).
Currently it only sets `data-mode="anchors"` on the viewport DOM node — no overlay
rendering is implemented yet.

Switch via `state.viewController?.setMode("anchors")` / `.setMode("editor")`.

---

## What is done

### CorePresentation auto-layout fix

`CorePresentation.ts` now subscribes to `"anchors:changed"` and schedules a layout
pass via `requestAnimationFrame` (debounced with `layoutScheduled_`). This means
anchor edits visually update without the user needing to resize the window.

### Chunks A + B + 2b — List view, drill-down, type dropdown, swap-derived

`AnchorsPanel.ts` is fully implemented. Key points:

**List view** (`renderElementAnchors_`, `renderSectionAnchors_`, `renderGroup_`,
`makeListRow_`):

- Renders anchor rows grouped by axis (Horizontal / Vertical for elements,
  Vertical only for sections).
- Each row: name | current value | expression description.
- `top` on sections shows as locked (non-clickable, dimmed).
- Clicking a non-locked row enters the detail view and switches the view mode to
  `"anchors"`.

**Detail view** (`renderDetail_`):

- Back button (clears `detail_` and `detailType_`, restores `"editor"` mode).
- Current value row (read-only).
- Branches on whether the expression is derived:
  - **Derived anchor** → `renderSwapDerivedDropdown_` only (no type selector).
  - **Constrained anchor** → `renderTypeDropdown_` + type-specific controls.

**Type dropdown** (`renderTypeDropdown_`):

- Options: Constant | Anchored | Fraction.
- Updates `detailType_` (the user's override) and re-renders via `update()`.
- `detailType_` is cleared when leaving the detail view.

**Swap-derived dropdown** (`renderSwapDerivedDropdown_`):

- Shown when the selected anchor is currently derived.
- Lists the other two slots on the same axis as options (excluding `top` for sections).
- Selecting an option builds a `buildHSwapDerivedOp` / `buildVSwapDerivedOp` and
  commits it immediately via `push_()`.
- After commit, `onDone` calls `this.update()` — the formerly-derived anchor is now
  constant, so the detail view re-renders with type controls.

**Constant editing** (`renderConstantEdit_`):

- Number input; auto-focused on first entry into detail.
- Commits on blur or Enter; Escape cancels. Double-commit prevented with `committed` flag.
- `alwaysCommit` flag forces a commit even when the numeric value is unchanged
  (used when the expression type is being changed, e.g. offset → constant).

**Operation builders** (module-level functions):

- `buildHSwapDerivedOp(element, currentDerived, newDerived, onDone)`
- `buildVSwapDerivedOp(subject, currentDerived, newDerived, onDone)`
- `buildHConstantOp(element, slot, newValue, onDone)`
- `buildVConstantOp(subject, slot, newValue, onDone)`

All call `onDone()` in both `execute` and `undo` — `AnchorsPanel` passes
`() => this.update()` so the panel re-renders on both commit and undo.

**State fields:**

- `detail_: DetailState | null` — null = list view; non-null = detail view.
- `detailType_: ExprType | null` — user's type override; null = use actual type.
- `focusOnRender_: boolean` — auto-focus only on first entry into detail.

### Chunk C — View mode toggle

- Entering detail view → `viewController.setMode("anchors")`.
- Back button → `viewController.setMode("editor")`.
- Subject change (selection moves while in detail) → `viewController.setMode("editor")`.

---

## What is NOT done

### Chunk D — Anchor reference picking (requires view-editor changes)

When the type dropdown is set to "Anchored" or "Fraction", the panel currently shows
a placeholder: "Anchor picking — coming in the next step."

What's needed:

1. **view-editor**: Add `"anchor:picked": { anchor: Anchor; source: PointerEvent }` to
   `EditorViewEvents`. In `"anchors"` mode, render overlay markers for every readable
   anchor in the presentation. User clicks a marker → emit `"anchor:picked"`.

2. **editor-component**: In `AnchorsPanel`, handle `"anchor:picked"`:
   - For "Anchored" type → create `OffsetAnchorExpression(pickedAnchor, 0)`, then show
     an offset adjustment control.
   - For "Fraction" type → create `FractionAnchorExpression(pickedAnchor, 1)`, then
     show a fraction adjustment control.
   - Wrap in `EditOperation` and commit via `push_()`.

The TODO comment in `AnchorsPanel.ts` (in `renderDetail_`'s else branch) marks the
placeholder that will be replaced.

---

## CSS

Anchor-panel classes live in `EditorStyles.ts` under the `/* ── Anchors panel */` block:

- `.re-anchor-group`, `.re-anchor-group__title`
- `.re-anchor-row`, `.re-anchor-row--locked`, `.re-anchor-row--clickable`
- `.re-anchor-row__name`, `.re-anchor-row__value`, `.re-anchor-row__expr`
- `.re-anchor-back`, `.re-anchor-detail-divider`
- `.re-anchor-edit-row`, `.re-anchor-select`
