# Presentation package review – 2026-02-19

This document captures a snapshot code/design review of the `presentation` package so we can revisit and refine later.

## 1. Immutability vs. reality

- **"Immutable" Section/Element vs mutable Style**
  - `Section` and `Element` are documented as immutable, but both expose a live, mutable `Style` via `.style`, and `FillStyle` has mutating setters.
  - In practice, model instances can be mutated after construction through style APIs.
- **Backdoor mutation via `_setElements` / `_setSections`**
  - `Section._setElements` and `Presentation._setSections` mutate internal arrays post-construction to support the builder pattern.
  - This is marked as internal but is still a public escape hatch; immutability is by convention after build.
- **Geometry is mutable but cloned on read**
  - `Presentation` owns a mutable `PresentationGeometry` and exposes `geometry` as a clone.
  - Callers cannot mutate geometry directly, but expressions and triggers observe the original mutable geometry via the module system. Correct, but subtle.

## 2. Mutability model and change propagation

- **Style changes vs. view updates are implicit**
  - Style is mutated freely (e.g. from XML via `loadFill`), but there is no explicit contract like “if you mutate style after build, call `presentation.display.layout()`”.
  - Today, the relationship between model mutation and view refresh is implicit rather than part of an explicit model.
- **Scroll trigger behaviour depends on geometry via expressions**
  - `ScrollTriggerDescriptorBuilder` encodes viewport offsets into expressions using `viewportHeight`.
  - `PresentationBuilder` wires a `viewportHeight` native expression based on `PresentationGeometry`.
  - This gives nice “live” behaviour when viewport changes, but the coupling between triggers and geometry is non-local and a bit magical unless you read both pieces together.

## 3. Responsibilities & coupling

- **Presentation = domain root + display orchestrator**
  - `Presentation` (via `createDisplay`) knows how to traverse sections/elements and call `realise`/`layout` on their views.
  - That makes it both the domain root and the top-level display controller, which is more than a pure data model.
- **ScrollTriggerDescriptor carries unused Presentation dependency**
  - `ScrollTriggerDescriptor`'s constructor accepts a `presentation` but never uses it.
  - The type appears coupled to `Presentation` but is effectively just an `Expression` wrapper.
- **ScrollTriggerDescriptorBuilder assumes root-module wiring**
  - The builder is "for a Presentation, Section, or Element" but hardcodes use of `viewportHeight`, relying on `PresentationBuilder` to define that on the root module.
  - Triggers for sections/elements still depend on that global wiring being correct.

## 4. Inspectable correctness / invariants

- **Builders rely on `finalize` discipline**
  - `PresentationBuilder`, `SectionBuilder`, `ElementBuilder`, and `ScrollTriggerDescriptorBuilder` assume `finalize()` is called before compile/build.
  - Correctness is enforced by runtime checks (`built_` flags) and tests, not by the type system. Misordering is possible in principle.
- **Expression-based layout is constrained but opaque**
  - Layout constraints are clearly enforced in builders (e.g. exactly 2 of `(left, width, right)` and `(top, height, bottom)`), which is good.
  - However, expressions are just strings; some invariants are only inspectable via tests, not types.

## 5. Type-level clarity and runtime type mashing

- **FromXML uses runtime probing for scroll-trigger support**
  - `loadElement` casts the element builder to an `anyBuilder` and checks for `createScrollTrigger` at runtime.
  - This works and is guarded, but it is a dynamic, reflective escape hatch rather than a compositional type for “supports scroll triggers”.
- **Inconsistent use of `import type` vs value imports**
  - Most files use `import type` for view interfaces and `ViewFactory`.
  - `ImageElement` imports `ViewFactory` and `ElementView` as value imports even though they are interfaces. Minor, but slightly blurs the pure model↔view boundary.

## 6. Single responsibility per unit

- **Section/Element docs vs actual role**
  - Docs describe them as immutable containers of layout properties, but they are also homes for styling and scroll trigger collections, and they know their parent (`Presentation`/`Section`).
  - They effectively act as small aggregates, not just pure value objects.
- **Styles concept is under-specified**
  - `Style` groups `FillStyle` and `BorderStyle`, but `BorderStyle` is currently empty.
  - It is not clear whether `Style` is meant to be an immutable value object (copied on change) or a mutable configuration bag (current behaviour).

## 7. Minor correctness / documentation nits

- **Stale terminology in Section docs**
  - `Section` docs still reference `DocumentBuilder`, which no longer exists.
  - This erodes trust in docs as the canonical description of the system.
- **"Experimental" viewportHeight behaviour**
  - The `viewportHeight` native expression in `PresentationBuilder` is marked experimental, yet scroll triggers already depend on it.
  - This suggests an uncertainty around behaviour that is effectively part of the public semantics of scroll triggers.

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
