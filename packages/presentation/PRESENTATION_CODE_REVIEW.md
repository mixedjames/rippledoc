# Presentation package review – 2026-02-20

This document captures a snapshot code/design review of the `presentation` package so we can revisit and refine later.

## 1. Immutability vs. reality

- **Backdoor mutation via `_setElements` / `_setSections`**
  - `Section._setElements` and `Presentation._setSections` still mutate internal arrays post-construction to support the builder pattern, now living in the `@rippledoc/presentationBuilder` package.
  - These methods are marked as internal but remain callable; immutability of the graph is enforced by convention and usage discipline rather than by the type system.
- **Geometry is mutable but cloned on read**
  - `Presentation` owns a mutable `PresentationGeometry` and exposes `geometry` as a clone.
  - Callers cannot mutate geometry directly, but expressions and triggers observe the original mutable geometry. Correct, but subtle.

## 2. Mutability model and change propagation

- **Geometry/transform changes vs. view updates are implicit**
  - Runtime mutability in this package is now concentrated in `PresentationGeometry` and the transform types (`SectionTransform`, `ElementTransform`).
  - There is still no explicit contract like “after changing geometry or transforms, call `presentation.display.layout()`”; the relationship between runtime state changes and view refresh remains implicit rather than part of an explicit model.

## 3. Responsibilities & coupling

- **Presentation = domain root + display orchestrator**
  - `Presentation` (via `createDisplay`) knows how to traverse sections/elements and call `realise`/`layout` on their views.
  - That makes it both the domain root and the top-level display controller, which is more than a pure data model.

## 4. Inspectable correctness / invariants

- **Layout invariants live in the builder package**
  - Expression-based layout constraints and builder lifecycle rules (`finalize`/`build` discipline) now reside in `@rippledoc/presentationBuilder`.
  - The `presentation` package mostly holds already-validated `Expression` instances and `PresentationGeometry`; few correctness invariants are enforced here beyond basic constructor checks.

## 5. Type-level clarity and runtime type mashing

- **Inconsistent use of `import type` vs value imports**
  - Most files use `import type` for view interfaces and `ViewFactory`.
  - `ImageElement` imports `ViewFactory` and `ElementView` as value imports even though they are interfaces. Minor, but slightly blurs the pure model↔view boundary.

## 6. Single responsibility per unit

- **Section/Element docs vs actual role**
  - Docs describe them as immutable containers of layout properties, but they are also homes for styling and scroll trigger collections, and they know their parent (`Presentation`/`Section`).
  - They effectively act as small aggregates, not just pure value objects.
- **Styles concept is under-specified**
  - `Style` groups `FillStyle` and `BorderStyle`, but `BorderStyle` is currently empty.
  - `Style` is now used as a cloned value snapshot on `Section`/`Element`, but the long-term intent (immutable value object vs richer configuration bag) is still not fully spelled out.

## 7. Minor correctness / documentation nits

- Previous nits around `DocumentBuilder` references and "experimental" `viewportHeight` wiring now live entirely in `@rippledoc/presentationBuilder` and are no longer concerns of this package's source.

---

This file is intentionally issue-focused. When we’re ready to address items, we can:

- Turn selected bullets into concrete tasks or TODOs.
- Iterate on design options (immutability story, responsibility boundaries, scroll trigger geometry coupling) and record decisions here.

---

## Target architecture: mutability and animation (draft)

This section sketches the desired end-state for the `presentation` package, based on current thinking.

### 1. Immutable document model

- **Immutable core graph**
  - `Presentation → Section → Element` is treated as an immutable graph once built (via builders or XML).
  - Public APIs do not expose mutators that structurally change this graph.

- **Layout as immutable intent**
  - Layout is expressed via `Expression` instances stored on `Section`/`Element`.
  - These expressions do not change post-build; only the _inputs_ (e.g. geometry, viewport) change.

- **Style as an immutable value object**
  - Each `Section` and `Element` has a `style: Style` that represents its _base_ visual design.
  - `Style` is treated as a value object: constructed during build/fromXML and not mutated thereafter.
  - Any runtime styling changes are expressed as overlays (see Transform / animation) rather than in-place style mutation on the model.

### 2. Geometry and style separation

- **Geometry lives on the model, mapping is separate**
  - Logical geometry (expressions for positions/sizes) lives on `Section`/`Element`.
  - `PresentationGeometry` remains a separate, mutable object responsible for mapping basis coordinates into viewport coordinates.

- **Style remains a separate child object**
  - Style is not flattened into many properties on `Section`/`Element`.
  - Instead, `Style` (and nested types like `FillStyle`) remain separate objects, to avoid clutter as style capabilities grow.
  - The asymmetry (geometry inline, style separate) is acceptable and pragmatic: geometry scope is small and stable, while style surface is expected to expand.

### 3. Explicit transform layer for runtime state

- **ElementTransform lives on the model**
  - Each `Element` (and optionally `Section`/`Presentation`) may expose an optional `transform` representing runtime, view-space adjustments (e.g. translation, scale, rotation, opacity).
  - This does not alter the core layout or base style; it is layered on top at render time.

- **Lazy, explicit activation**
  - `transform` is not allocated for every element by default.
  - Access is via an explicit API, e.g. `enableAnimation()` or similar, which:
    - Allocates an `ElementTransform` when first called.
    - Marks the element as `animated` (or equivalent flag).
  - Callers that only need to _read_ animation state check a cheap flag (`animated`) and only access `.transform` when true, avoiding accidental mass allocation.

- **Transform as purely runtime state**
  - `ElementTransform` is not persisted to XML and is not considered part of the canonical document state.
  - It is owned by the runtime/animation layer but hangs off the immutable document nodes for convenience and inspectability.

### 4. Clear change flows

- **Changing the document**
  - Requires rebuilding a `Presentation` via builders or `presentationFromXML`.
  - Clients treat the result as an immutable snapshot.

- **Changing geometry / viewport**
  - Performed via `PresentationGeometry` APIs (e.g. `setViewportDimensions`).
  - Views respond by calling `presentation.display.layout()` (or equivalent) to recompute view layout based on updated mapping.

- **Animating elements**
  - Performed by manipulating `ElementTransform` (and related runtime state), not by changing layout expressions or base styles.
  - Views combine:
    - Basis coordinates from expressions.
    - Viewport mapping from `PresentationGeometry`.
    - Affine transform from `ElementTransform`.

This target architecture should make the "immutable document + runtime transform" story explicit, keep the core model inspectable, and give a clean home for animation and other dynamic behaviour.

## 2026-02-19 session summary (high level)

- Clarified the mutability story: `Presentation`, `Section`, and `Element` are treated as immutable snapshots once built; runtime change lives in `PresentationGeometry` and the transform layer.
- Tightened the conceptual divide between base, immutable `Style` as a value object and runtime visual changes expressed via overlays/transforms instead of in-place mutation.
- Agreed that animation and other dynamic behaviour should hang off `ElementTransform` (and related runtime state), leaving layout expressions and base style as stable intent.
- Identified follow-ups: align docs with this model (clean up “immutable” vs actual behaviour), and evolve APIs so enabling animation/transform access is an explicit, opt-in step.
