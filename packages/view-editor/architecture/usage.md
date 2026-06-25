# view-editor — Usage

`view-editor` renders a `presentation4` presentation in the DOM with editor-specific chrome: selection highlighting, pointer picking, keyboard events, and pin animation support.

## Entry point

```ts
import { createEditorView } from "@rippledoc/view-editor";

const editor = createEditorView({ container: "#app" });
// or: container: document.getElementById("app")

presentation.attachView(editor.viewFactory);
```

`createEditorView` returns an `EditorViewController`. This object is stable for its lifetime — mode, selection, the active tool, and subscriptions survive `attachView` / `detach` cycles.

## View modes

Two modes control what the view renders:

| Mode       | Behaviour                                                   |
| ---------- | ----------------------------------------------------------- |
| `"editor"` | Full rendering + selection chrome. Default.                 |
| `"player"` | Full rendering, selection chrome hidden. Read-only preview. |

```ts
editor.setMode("player");
```

Mode is surfaced as `data-mode` on the viewport element inside the Shadow DOM. CSS rules react to it without a JS cascade through the view hierarchy.

## Events

Subscribe via `editor.events.on(event, listener)`. Each call returns an unsubscribe function.

| Event                 | Payload                           | When                                                         |
| --------------------- | --------------------------------- | ------------------------------------------------------------ |
| `element:picked`      | `{ element, source }`             | Fired on `pointerdown` over an element                       |
| `element:pointerDown` | `{ element, source }`             | Same tick as `element:picked`                                |
| `element:pointerUp`   | `{ element, source }`             | Fired on `pointerup` over an element                         |
| `section:picked`      | `{ section, source }`             | `pointerdown` on a section background (not over any element) |
| `section:pointerDown` | `{ section, source }`             | Same tick as `section:picked`                                |
| `section:pointerUp`   | `{ section, source }`             | `pointerup` on a section background                          |
| `trigger:picked`      | `{ trigger, source }`             | `pointerdown` on a trigger band                              |
| `key:down`            | `{ source }`                      | Keyboard event while the viewport has focus                  |
| `key:up`              | `{ source }`                      | Keyboard event while the viewport has focus                  |
| `selection:changed`   | `{ elements, sections, triggers}` | Any mutation to the selection set                            |
| `focus:changed`       | `FocusState`                      | The focused element changes or is cleared                    |

`element:picked` is the intended hook for click-to-select. The view does **not** mutate the selection itself — that is the caller's responsibility.

```ts
editor.events.on("element:picked", ({ element, source }) => {
  if (source.shiftKey) editor.selection.addElement(element);
  else editor.selection.setElements([element]);
});

editor.events.on("key:down", ({ source }) => {
  if (source.key === "Escape") editor.selection.clear();
});
```

## Selection and focus

`editor.selection` is an `EditorSelectionController`. Elements, sections, and triggers are separate sets that are mutually exclusive — see [selection-model.md](selection-model.md) for the full model including the focused element.

## Tools

A tool is a caller-supplied object that receives interactive events while it is the active tool. Install one with `editor.setActiveTool(tool)`; deactivate with `editor.setActiveTool(NullTool)`.

```ts
import { NullTool } from "@rippledoc/view-editor";

// Anchor-picker tool: single-click sets focused element, nothing else.
const anchorPickerTool = {
  onElementPicked({ element }) {
    editor.selection.setFocusedElement(element);
  },
};

editor.setActiveTool(anchorPickerTool);
// ... later, when done picking:
editor.setActiveTool(NullTool);
```

Only one tool is active at a time. Swapping is a single call — no subscription management needed. Global `editor.events.on()` subscribers still receive all events regardless of which tool is active; tools are an additive layer, not a replacement.

Events routed to tools: `element:picked`, `element:pointerDown`, `element:pointerUp`, `section:picked`, `section:pointerDown`, `section:pointerUp`, `trigger:picked`, `key:down`, `key:up`. State-change events (`selection:changed`, `focus:changed`) are not routed to tools.

## Pin animations

Pin animations from `presentation4` are handled transparently. When an element has pins, the view creates a clone in a non-scrolling overlay layer and swaps the original/clone on pin trigger events, producing a "sticky element" effect without `position: fixed`. No extra configuration is needed.

## Style encapsulation

The view renders into a Shadow DOM attached to a wrapper div inside the caller-supplied container. This isolates the presentation's internal CSS from the host page. The host page's styles do not bleed into the presentation.
