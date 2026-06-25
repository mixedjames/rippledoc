# view-editor — Architecture

## Package layout

```
src/
  clientAPI/            ← stable public surface; what consumers import
    EditorViewController.ts
    EditorSelectionController.ts
    EditorViewEvents.ts
    EditorTool.ts
    ViewMode.ts
    FocusState.ts
  viewCore/             ← internals; never imported directly by consumers
    EditorViewControllerImpl.ts
    utils/
      TypedEmitter.ts
      colorToCss.ts
    views/
      EditorPresentationView.ts   ← p4.PresentationView implementation
      EditorSectionView.ts        ← p4.SectionView implementation
      EditorTriggerBandView.ts    ← editor chrome for a single ScrollTrigger
      EditorPinManager.ts
      PresentationDOM.ts          ← owns the Shadow DOM structure
      animation/
        AnimationDriver.ts        ← interface for all animation drivers
        EditorAnimationManager.ts ← per-element animation lifecycle
        WaapiAnimationDriver.ts   ← CSS-animatable props via Web Animations API
        ManualAnimationDriver.ts  ← abstract base for tick-driven drivers
      elements/
        EditorElementView.ts      ← p4.ElementView base class
        EditorMarkdownElementView.ts
        EditorBitmapImageElementView.ts
        EditorSVGImageElementView.ts
```

## The controller / view split

`EditorViewControllerImpl` is the stable owner of all persistent state: mode, selection sets, and the event emitter. It is created by `createEditorView` and returned to the caller as `EditorViewController`.

`EditorPresentationView` (and all descendant views) is ephemeral — it is created when `presentation.attachView(controller.viewFactory)` is called and destroyed if the presentation is replaced. The controller survives; the view does not need to.

When a new view attaches, the controller calls `registerView(view)` which replays the current mode onto the new view immediately. Selection chrome self-initialises in each element/section/trigger view constructor, so no replay is needed for selection.

```
EditorViewControllerImpl          (stable)
  └── EditorPresentationView      (ephemeral)
        ├── EditorSectionView     (one per section)
        │     └── EditorElementView  (one per element)
        └── EditorTriggerBandView (one per trigger)
```

## DOM structure

The view renders into a Shadow DOM attached to a wrapper `<div>` inside the caller-supplied container. This isolates internal CSS from the host page.

```
container (caller-supplied)
  └── root <div>
        └── shadowRoot
              ├── <style>           ← component styles (selection chrome, mode rules)
              └── viewport <div>    ← overflow-y:auto, tabIndex=0; scroll + keyboard container
                    ├── backgrounds <div>  ← one child per section (background/border styling)
                    ├── triggers <div>     ← one child per trigger (trigger band chrome)
                    └── elements <div>     ← one child per element, in global virtual coords
              └── overlay <div>     ← pointer-events:none
                    └── pins <div>  ← non-scrolling clone layer for pinned elements
```

**Three separate layers for sections, triggers, and elements.** Section backgrounds go in `backgrounds`; trigger bands go in `triggers`; element divs go in `elements`. Because elements are positioned in global virtual coordinates (not relative to their section), all element divs sit directly in the `elements` container regardless of section ownership.

**Pointer event routing.** The `elements` and `triggers` divs have `pointer-events: none`. Individual element and trigger band divs opt back in with `pointer-events: auto`. Clicks on empty space fall through to the `backgrounds` layer, where `EditorSectionView` listens for section picking.

## View mode mechanism

Mode is stored on `EditorViewControllerImpl` and applied to the DOM via `data-mode` on the `viewport` and `pins` elements. CSS rules inside the Shadow DOM react declaratively:

```css
/* Selection chrome visible in editor mode only */
.viewport[data-mode="editor"] .element.selected {
  outline: 2px solid hsl(220 80% 55%);
}

/* Trigger bands hidden outside editor mode */
.viewport[data-mode="editor"] .trigger-band {
  display: block;
}
```

When `controller.setMode(mode)` is called, only one DOM attribute write is needed — no JS cascade through section or element views.

## Avoiding circular dependencies

`EditorPresentationView` imports `EditorViewControllerImpl` to wire the view factory and call `emit()`. The controller must not import back. This is enforced by the `AttachedView` structural interface in `EditorViewControllerImpl.ts`: the controller holds an `AttachedView` (with only `applyMode`), not a concrete `EditorPresentationView`.

The same pattern is used in `EditorAnimationManager`: it imports `EditorPresentationView` only through a local `AnimationHost` structural interface to avoid a circular import with `EditorPresentationView`'s registration Set.

## Pin manager

When an element has pin animations, `EditorElementView` creates an `EditorPinManager` instead of the no-op `NullEditorPinManager`. The pin manager wraps the element's DOM node in a `translateY` wrapper and maintains a clone in the non-scrolling `pins` overlay. On each trigger event (`start`/`end`/`reverseStart`/`reverseEnd`) it swaps which of the two is visible, producing a "sticky element" effect without `position: fixed`.

The `NullEditorPinManager` no-op avoids null checks at call sites in `EditorElementView` with zero overhead for the common unpinned case.

## Animation manager

Each element view owns an `EditorAnimationManager` which creates one `AnimationDriver` per keyframe animation. Drivers are gated by `animationEnabled` on `EditorPresentationView` — animations run only in player mode. `EditorPresentationView` holds a registry of all active managers and calls `setEnabled()` on them when the mode changes.

Current driver: `WaapiAnimationDriver` (Web Animations API, CSS-animatable properties). Two driver types are stubbed but not yet implemented: sub-component SVG targeting and `ManualAnimationDriver` for `traceStroke` and other tick-driven mechanics.
