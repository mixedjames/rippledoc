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

## Content-derived dimensions

Distinct from the 2-of-3 derived anchor, an element's size on one axis can be
**content-derived**: the view measures the rendered content and feeds that size back into
the anchor system. This is analogous to CSS `height: auto`.

`element.contentDependentDimension` returns `"none"` | `"height"` | `"width"`.

When an axis is content-derived:

- The size slot (`height` or `width`) has no meaningful expression — its value comes from
  measurement, not from an anchor formula.
- The position anchor on that axis (top/bottom for height, left/right for width) still uses
  a normal expression. Exactly one position anchor is provided; the other edge is implied.
- Both axes cannot be content-derived simultaneously.

**Setting content-derived via the API:**

```ts
element.setAutoHeight({ top: expr }); // fix top, measure height
element.setAutoHeight({ bottom: expr }); // fix bottom, measure height
element.setAutoWidth({ left: expr }); // fix left, measure width
element.setAutoWidth({ right: expr }); // fix right, measure width
```

Calling `setAutoHeight` or `setAutoWidth` clears all previously set anchors on that axis.

**Display in the toolbox (planned — see TODO section):**

- In the list view the size slot shows "auto" rather than a value / expression type.
- In the detail view for that slot, instead of the type dropdown + edit controls, the panel
  shows the content-derived status and a button to switch back to explicit constraints.
- The detail view for the _position_ slot on a content-derived axis should offer a
  "set to auto height / auto width" toggle that calls `setAutoHeight` / `setAutoWidth`.

---

## Element vs section differences

**Elements** (`clientAPI/Element.ts`):

- `setHorizontalAnchors(descriptor)` — 2-of-3: left / right / width
- `setVerticalAnchors(descriptor)` — 2-of-3: top / bottom / height
- `setAutoHeight(options)` — makes height content-dependent
- `setAutoWidth(options)` — makes width content-dependent
- All 6 anchors are user-editable in the toolbox (with content-derived exceptions above)

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
- Clicking a non-locked row enters the detail view.

**Detail view** (`renderDetail_`):

- Back button (clears `detail_`, `detailType_`, `anchorRePickMode_`, and `anchorPickingTarget_`).
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

**Constant editing** (inline in `renderDetail_` via `renderNumberEdit_`):

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
- `anchorRePickMode_: boolean` — true when the user has clicked "change" to re-pick a
  base anchor; forces `renderAnchorPicking_` even when an expression is already set.
- `anchorPickingTarget_: Element | Section | null` — the element/section chosen in Stage 1
  of the two-stage anchor chooser; null means no target chosen yet.

### Chunk D — Anchor reference picking (two-stage chooser)

`AnchorsPanel` uses a two-stage sidebar chooser for Anchored and Fraction expressions.
Viewport anchor handle chips are not used for picking.

- `renderAnchorPicking_` — shown when the type is "Anchored" or "Fraction" and either
  no expression is set yet OR `anchorRePickMode_` is true (user clicked "change").
  - **Stage 1** — "element" dropdown listing all elements/sections in the presentation that
    have ≥1 valid anchor for the current axis group. Subject itself is excluded to prevent
    circular refs. Labels: section name for sections, `"sectionName › elementName"` for
    elements. On selection, sets `anchorPickingTarget_` and re-renders.
  - **Stage 2** — "anchor" dropdown (only once a target is chosen) listing the valid slot
    names for the target (filtered by `validSlotsForGroup`). On selection, looks up
    `target.anchors[slot]`, builds a ref op via `buildHRefOp` / `buildVRefOp`, and commits.
    After commit, `anchorRePickMode_` and `anchorPickingTarget_` are cleared.
- `renderOffsetEdit_` — shown once an `OffsetAnchorExpression` is set. Displays the base
  anchor as `"name · slot  (value)"` (resolved via `findAnchorLabel`) and a "change" button
  that sets `anchorRePickMode_ = true` to re-enter picking.
- `renderFractionEdit_` — same pattern for `FractionAnchorExpression`.
- `renderNumberEdit_` — shared number-input helper used by constant, offset, and fraction editing.

**Helpers** (module-level):

- `slotPickGroup(slot)` — maps a slot name to pick group `"h"` | `"v"` | `"s"`.
- `validSlotsForGroup(group, target)` — returns the slot names on `target` valid for `group`.
  Sections have no horizontal slots; only vertical slots and height.
- `findAnchorLabel(anchor, pres)` — scans the presentation tree to produce a human-readable
  label `"ownerName · slot"` for a given anchor object.

---

## What is NOT done

### TODO — Content-derived dimension support in AnchorsPanel

The panel does not yet handle `element.contentDependentDimension !== "none"`. When an
axis is content-derived:

**List view:**

- The size slot (`height` or `width`) should show "auto" (not a numeric value) and
  a description of "content" rather than an expression type.

**Detail view for the size slot:**

- Should not show the type dropdown or editing controls.
- Should show "auto (content)" status and a "Remove auto" button that calls
  `setVerticalAnchors` / `setHorizontalAnchors` with explicit expressions to restore
  anchor control. The natural restore is: set the size slot to `constant(currentValue)`,
  keeping the position anchor's expression unchanged.

**Detail view for the position slot on a content-derived axis:**

- Should show the normal type/editing controls for that position anchor's expression.
- Should additionally offer a "Make height auto" / "Make width auto" toggle. Activating
  it calls `setAutoHeight({ top: currentExpr })` or `setAutoHeight({ bottom: currentExpr })`
  depending on which slot is selected. The panel will need to infer which position anchor
  to keep (the one that is not derived on that axis).

---

## CSS

Anchor-panel classes live in `EditorStyles.ts` under the `/* ── Anchors panel */` block:

- `.re-anchor-group`, `.re-anchor-group__title`
- `.re-anchor-row`, `.re-anchor-row--locked`, `.re-anchor-row--clickable`
- `.re-anchor-row__name`, `.re-anchor-row__value`, `.re-anchor-row__expr`
- `.re-anchor-back`, `.re-anchor-detail-divider`
- `.re-anchor-edit-row`, `.re-anchor-select`

Panel-internal button:

- `.re-anchor-repick` — small inline "change" button on the base-anchor row in offset/fraction editing
