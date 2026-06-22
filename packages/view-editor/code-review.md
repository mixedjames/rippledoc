# view-editor — Code Review Todo

Items are grouped by theme. Each is self-contained so context can be rebuilt from this file alone.

---

## Documentation

### DOC-1 — Invalid method in `createEditorView` JSDoc

**File:** `src/viewCore/views/EditorPresentationView.ts:21`  
The JSDoc example calls `editor.selection.add(someElement)` — no such method exists. Should be `editor.selection.addElement(someElement)`.

- [ ] Fix the example.

---

### DOC-2 — Misleading comment on `element:picked`

**File:** `src/clientAPI/EditorViewEvents.ts:6–7`  
Comment reads: "Distinct from pointerDown so clients can treat a simple tap as a pick without also handling pointerDown."  
Both `element:picked` and `element:pointerDown` are always emitted together from the same `onPointerDown_` handler — neither filters the other. The distinction is purely semantic (naming intent), not temporal or conditional. The comment implies filtering that doesn't exist and would confuse a reader who then looks at `EditorElementView`.  
Same issue applies symmetrically to `section:picked` / `section:pointerDown`.

- [ ] Rewrite the comment to state the semantic intent clearly without implying different firing conditions.

---

### DOC-3 — Stale "future:" qualifier on overlay

**File:** `src/viewCore/views/PresentationDOM.ts:17`  
DOM diagram comment says: "overlay (div, pointer-events:none — future: selection UI overlays)"  
The overlay already has a concrete, live use — it parents the `pins` container. "Future" is no longer accurate.

- [ ] Remove or update the qualifier.

---

### DOC-4 — `setElements([])` vs `clear()` silently differ on event firing

**Files:** `architecture/selection-model.md`, `src/clientAPI/EditorSelectionController.ts`, `src/viewCore/EditorViewControllerImpl.ts`  
The docs and interface JSDoc say `setElements([])` is equivalent to `clear()`. In state terms it is, but `setElements` always fires `selection:changed` even when both sets were already empty; `clear()` only fires when something was non-empty. This is a silent behavioural difference that could surprise a caller.

- [ ] Either align the implementations, or document the distinction explicitly in the interface comment and architecture doc.

---

## Correctness

### COR-1 — Non-null assertion with no runtime guard on `viewFactory_`

**File:** `src/viewCore/EditorViewControllerImpl.ts:39,54`

```ts
private viewFactory_: p4.PresentationViewFactory | null = null;
get viewFactory() { return this.viewFactory_!; }
```

`setFactory()` must be called before `viewFactory` is ever read. This is only guaranteed by the `createEditorView` factory closure — nothing prevents constructing `EditorViewControllerImpl` directly and accessing `viewFactory` before `setFactory` is called, which silently returns `null` cast to non-null.  
Options: throw an explicit error in the getter, or pass the factory as a constructor parameter (factory thunk that receives `ctrl` by reference solves the chicken-and-egg).

- [ ] Decide on approach and fix.

---

### COR-2 — Dangling fetch after `destroy()` in `EditorSVGImageElementView`

**File:** `src/viewCore/views/EditorSVGImageElementView.ts:24–50`  
The `fetch` chain started in `loadSVG_()` is not cancelled when `destroy()` is called. If the element is destroyed mid-fetch:

1. `placeholder.replaceWith(imported)` runs on a detached placeholder — silent no-op, benign.
2. `this.notifyContentChanged()` → `pinManager_.onContentChanged()` → `refreshClone_()` → `elementDiv_.cloneNode(true)` runs on a detached div; the clone is appended to the disconnected pins container.  
   Fix: add an `AbortController`, call `abort()` in `destroy()`, and check `signal.aborted` (or catch `AbortError`) in the `.then()` chain.

- [ ] Implement fetch cancellation on destroy.

---

### COR-3 — `EditorBitmapImageElementView` renders no image content

**File:** `src/viewCore/views/EditorBitmapImageElementView.ts`  
The class adds a CSS class and nothing else. `EditorElementView.applyStyle` handles fill, border, and font — but no image `src`. If `p4.BitmapImageElementViewOwner` exposes a URL, it is never consumed here.

- [ ] Clarify whether this is intentional (image rendered via another mechanism) and add a comment, or implement the missing rendering.

---

## Tests

### TEST-1 — No DOM test for section selection chrome

**File:** `src/viewCore/tests/EditorView.test.ts`  
The integration tests cover element `.selected` / `.focused` classes thoroughly but there is no test verifying that `addSection()` / `removeSection()` / `setSections()` toggle the `.selected` class on the section's background div.

- [ ] Add DOM-level section selection tests (add, remove, clear, setElements cross-clears sections).

---

### TEST-2 — View re-attach doesn't test selection survival

**File:** `src/viewCore/tests/EditorView.test.ts`  
The single view-swap test only checks that mode survives re-attach. The architecture doc explicitly states: "Selection chrome self-initialises in each element/section view constructor" — this claim is untested at integration level.

- [ ] Add a test: select an element before re-attach; verify the `.selected` class is present on the new view's element div immediately after `presentation.attachView()`.

---

### TEST-3 — `EditorPinManager` has zero tests

**File:** `src/viewCore/views/EditorPinManager.ts`  
This is the most complex class in the package: a 4-state machine (`pinForward`, `unpinForward`, `pinReverse`, `unpinReverse`) with cumulative `deltaY_` bookkeeping, clone/original visibility swapping, and selection/focus class sync on the clone. There are no tests for any of it.  
Key invariant worth testing: `positionClone_` requires `deltaY_` to exclude the current pin's height; `pinForward_` and `pinReverse_` both enforce this differently.

- [ ] Add unit or integration tests covering at minimum: pin activation shows clone / hides original; unpin restores original; `deltaY_` accumulates correctly across multiple sequential pins; selection class syncs to clone while pinned.

---

### TEST-4 — No tests for `EditorSVGImageElementView`

**File:** `src/viewCore/views/EditorSVGImageElementView.ts`  
The async SVG load path, placeholder → real SVG swap, error branch (`console.error`), and `notifyContentChanged()` call are all untested.

- [ ] Add tests: successful load replaces placeholder; failed fetch logs error and leaves placeholder; destroy mid-fetch does not throw.

---

### TEST-5 — `TypedEmitter`: no mutation-during-emit test

**File:** `src/viewCore/TypedEmitter.ts`  
`emit()` iterates the listener `Set` live. If listener A's handler unsubscribes listener B (not yet visited), B is deleted from the `Set` before it's reached and silently does not fire. This is well-defined in ECMAScript but surprising. There is no test documenting the behaviour.

- [ ] Add a test that explicitly documents what happens when a listener is unsubscribed by another listener during emission.

---

## Minor

### MIN-1 — Two classes in one file

**File:** `src/viewCore/EditorViewControllerImpl.ts`  
`EditorSelectionControllerImpl` is private to the module (not exported), which is legitimate. The co-location is pragmatic given shared `Set` references and callback coupling. Worth splitting if either class grows significantly.

- [ ] No immediate action; revisit if the file exceeds ~400 lines.

---

### MIN-2 — `forEach` vs `for...of` in `EditorPinManager.disconnect`

**File:** `src/viewCore/views/EditorPinManager.ts:123`  
`this.unsubscribe_.forEach(fn => fn())` — rest of the codebase uses `for...of`. Trivial inconsistency.

- [ ] Change to `for (const fn of this.unsubscribe_) fn()`.
