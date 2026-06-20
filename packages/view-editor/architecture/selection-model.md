# view-editor — Selection Model

## Two types, mutually exclusive

The selection holds either elements or sections — never both at the same time. Any write to one type automatically clears the other.

```ts
editor.selection.addElement(el); // clears sections if any were selected
editor.selection.addSection(section); // clears elements if any were selected
```

This is enforced inside `EditorSelectionControllerImpl`. `clearSectionsIfNeeded_()` / `clearElementsIfNeeded_()` run at the start of each write and fire an additional `selection:changed` event only if something was actually cleared.

## Controller interface

```ts
interface EditorSelectionController {
  addElement(element: Element): void;
  removeElement(element: Element): void;
  setElements(elements: Iterable<Element>): void; // replaces; clears sections
  hasElement(element: Element): boolean;
  readonly elements: ReadonlySet<Element>;

  addSection(section: Section): void;
  removeSection(section: Section): void;
  setSections(sections: Iterable<Section>): void; // replaces; clears elements
  hasSection(section: Section): boolean;
  readonly sections: ReadonlySet<Section>;

  clear(): void;
}
```

`elements` and `sections` are `ReadonlySet` views directly over the internal sets — no copy is made on each read.

## Who mutates the selection

The view **never** mutates the selection in response to pointer events. `EditorElementView` emits `element:picked` on `pointerdown`; the caller decides whether that means set, add, or ignore. This keeps selection policy entirely in the caller.

```ts
// Typical single-select with shift-to-add:
editor.events.on("element:picked", ({ element, source }) => {
  if (source.shiftKey) editor.selection.addElement(element);
  else editor.selection.setElements([element]);
});
```

## Selection chrome

Each `EditorElementView` and `EditorSectionView` manages its own selection chrome. In their constructors they:

1. Subscribe to `selection:changed` and toggle a `"selected"` CSS class on their root div.
2. Check current state immediately via `hasElement()` / `hasSection()` and apply the class now — the event won't fire retroactively for views that arrive after a selection is established.

This self-subscription model means no external cascade is needed. Views added or removed at runtime are always in sync without any controller involvement.

## The selection:changed event

Fired by `EditorViewControllerImpl.onSelectionChanged()` after every mutation. Always carries both full current sets:

```ts
{
  elements: ReadonlySet<Element>;
  sections: ReadonlySet<Section>;
}
```

Even when only one type changes, both sets are included so listeners never need to hold stale state from a previous event.

The event is fired once per logical mutation, not once per object added or removed. Bulk operations (`setElements`, `setSections`, `clear`) produce a single event. The implicit cross-type clear also produces only one event — not two.

## Pin clones and selection

When an element is pinned, its clone in the non-scrolling overlay must stay visually in sync with the original. `EditorPinManager` subscribes to `selection:changed` and toggles `"selected"` on the active clone whenever a pin transition is in progress. It subscribes to `focus:changed` for the same reason and toggles `"focused"` on the clone in parallel.

## The focused element

Alongside the selection sets, the controller tracks a single _focused element_ — the element that is the current target for a specific operation (e.g. the element being anchored to). It is independent of the selection sets; callers decide whether focus should track selection or not.

### Type

`FocusState` is a discriminated union that avoids `null` in the public interface:

```ts
type FocusState =
  | { readonly focused: true; readonly element: Element }
  | { readonly focused: false };
```

TypeScript narrows the type on `if (state.focused)`, so `state.element` is only accessible inside the true branch — a compile-time guarantee rather than a runtime guard.

### Controller interface

Added to `EditorSelectionController`:

```ts
setFocusedElement(element: Element): void;
clearFocusedElement(): void;
readonly focus: FocusState;
```

`setFocusedElement` is idempotent — calling it twice with the same element fires `"focus:changed"` only once. `clearFocusedElement` is a no-op (no event) when nothing is focused.

### The focus:changed event

```ts
"focus:changed": FocusState;
```

The payload _is_ the new `FocusState`, so listeners can switch on `state.focused` and either read `state.element` or know the focus was cleared — no second event type needed.

### Focus chrome

Each `EditorElementView` self-subscribes to `"focus:changed"` in its constructor (same pattern as `"selection:changed"`) and toggles a `"focused"` CSS class on its root div. The CSS rule uses `box-shadow` rather than `outline` so that focus and selection chrome can both be visible simultaneously on the same element:

```css
.viewport[data-mode="editor"] .element.focused {
  box-shadow: 0 0 0 3px hsl(35 90% 55%);
}
```
