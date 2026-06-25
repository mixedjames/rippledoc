# view-editor — Selection Model

## Three types, mutually exclusive

The selection holds elements, sections, or triggers — never a mix. Any write to one
type automatically clears the other two.

```ts
editor.selection.addElement(el); // clears sections and triggers if any were selected
editor.selection.addSection(section); // clears elements and triggers if any were selected
editor.selection.addTrigger(trigger); // clears elements and sections if any were selected
```

## Controller interface

```ts
interface EditorSelectionController {
  addElement(element: Element): void;
  removeElement(element: Element): void;
  setElements(elements: Iterable<Element>): void; // replaces; clears sections + triggers
  hasElement(element: Element): boolean;
  readonly elements: ReadonlySet<Element>;

  addSection(section: Section): void;
  removeSection(section: Section): void;
  setSections(sections: Iterable<Section>): void; // replaces; clears elements + triggers
  hasSection(section: Section): boolean;
  readonly sections: ReadonlySet<Section>;

  addTrigger(trigger: ScrollTrigger): void;
  removeTrigger(trigger: ScrollTrigger): void;
  setTriggers(triggers: Iterable<ScrollTrigger>): void; // replaces; clears elements + sections
  hasTrigger(trigger: ScrollTrigger): boolean;
  readonly triggers: ReadonlySet<ScrollTrigger>;

  clear(): void;
}
```

`elements`, `sections`, and `triggers` are `ReadonlySet` views directly over the internal
sets — no copy is made on each read.

## Who mutates the selection

The view **never** mutates the selection in response to pointer events. `EditorElementView`
emits `element:picked` on `pointerdown`; `EditorTriggerBandView` emits `trigger:picked`
on `pointerdown`. The caller decides what each pick means. This keeps selection policy
entirely in the caller.

```ts
// Typical single-select with shift-to-add:
editor.events.on("element:picked", ({ element, source }) => {
  if (source.shiftKey) editor.selection.addElement(element);
  else editor.selection.setElements([element]);
});

editor.events.on("trigger:picked", ({ trigger }) => {
  editor.selection.setTriggers([trigger]);
});
```

## The selection:changed event

Fired after every mutation. Always carries all three full current sets:

```ts
{
  elements: ReadonlySet<Element>;
  sections: ReadonlySet<Section>;
  triggers: ReadonlySet<ScrollTrigger>;
}
```

Even when only one type changes, all three sets are included so listeners never need to
hold stale state from a previous event. The event fires once per logical mutation — bulk
operations (`setElements`, `setSections`, `setTriggers`, `clear`) produce a single event,
not one per object.

## The focused element

Alongside the selection sets, the controller tracks a single _focused element_ — the
element that is the current target for a specific operation (e.g. the element being
anchored to). It is independent of the selection sets; callers decide whether focus
should track selection or not.

`FocusState` is a discriminated union that avoids `null` in the public interface:

```ts
type FocusState =
  | { readonly focused: true; readonly element: Element }
  | { readonly focused: false };
```

TypeScript narrows the type on `if (state.focused)`, so `state.element` is only accessible
inside the true branch — a compile-time guarantee rather than a runtime guard.

```ts
setFocusedElement(element: Element): void;
clearFocusedElement(): void;
readonly focus: FocusState;
```

`setFocusedElement` is idempotent — calling it twice with the same element fires
`"focus:changed"` only once. `clearFocusedElement` is a no-op (no event) when nothing
is focused.

The `"focus:changed"` event payload _is_ the new `FocusState`, so listeners can switch
on `state.focused` and either read `state.element` or know the focus was cleared — no
second event type needed.

---

## Implementation notes

_Internal mechanics. Relevant for maintainers of view-editor, not for consumers._

### Selection chrome — self-subscription

Each `EditorElementView`, `EditorSectionView`, and `EditorTriggerBandView` manages its own
selection chrome. In their constructors they:

1. Subscribe to `selection:changed` and toggle a `"selected"` CSS class on their root div.
2. Check current state immediately via `hasElement()` / `hasSection()` / `hasTrigger()`
   and apply the class now — the event won't fire retroactively for views that arrive
   after a selection is established.

This self-subscription model means no external cascade is needed. Views added or removed
at runtime are always in sync without any controller involvement.

The implicit cross-type clear produces only one `selection:changed` event (not two), so
views never see a transient state where both old and new types appear selected.

### Focus chrome

Each `EditorElementView` self-subscribes to `"focus:changed"` in its constructor (same
pattern as `"selection:changed"`) and toggles a `"focused"` CSS class on its root div.
The focused state uses a dashed amber outline so it remains visually distinct when an
element is both selected and focused simultaneously:

```css
.viewport[data-mode="editor"] .element.focused {
  outline: 2px dashed hsl(35 90% 50%);
  outline-offset: 1px;
}
```

### Pin clones and selection

When an element is pinned, its clone in the non-scrolling overlay must stay visually in
sync with the original. `EditorPinManager` subscribes to `selection:changed` and toggles
`"selected"` on the active clone whenever a pin is active (clone visible, original hidden).
It subscribes to `focus:changed` for the same reason and toggles `"focused"` on the clone
in parallel. When the pin is inactive the original is visible and manages its own classes
directly via its `EditorElementView` subscriptions, so no clone sync is needed.
