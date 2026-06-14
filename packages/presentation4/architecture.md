# presentation4 — Interface Architecture

## Three Layers

The package is divided into three layers with deliberate boundaries. Each role
(client, view implementor, core implementation) has a specific set of interfaces
it programs against, and importing across those boundaries is controlled.

```
┌─────────────────────────────────────────────────────┐
│  clientAPI   src/clientAPI/                         │
│  Pure interfaces. What consumers of the package     │
│  program against. No concrete classes, no view      │
│  mechanics. Exported from the package root.         │
├─────────────────────────────────────────────────────┤
│  viewAPI     src/viewAPI/                           │
│  Interfaces for view implementations. Re-exports    │
│  clientAPI in full, plus the view bridge (View      │
│  interfaces and ViewOwner interfaces).              │
├─────────────────────────────────────────────────────┤
│  core        src/core/                              │
│  Concrete classes (Core* prefix). Tight coupling    │
│  within this layer is fine. Never exported from     │
│  the package root.                                  │
└─────────────────────────────────────────────────────┘
```

The anchor system (`src/anchors/`) is a standalone subsystem imported by all
three layers.

## Import Rules

| Role                    | Import from                               |
| ----------------------- | ----------------------------------------- |
| Client code             | `@rippledoc/presentation4` (package root) |
| View implementations    | `@rippledoc/presentation4/viewAPI`        |
| Core classes (internal) | Any layer — they are the implementation   |

View implementations should use a single namespace import:

```typescript
import * as p4 from "@rippledoc/presentation4/viewAPI";
```

## Source Tree

```
src/
  index.ts              Package root barrel (re-exports clientAPI)

  anchors/
    Anchor.ts           Anchor interface + AnchorExpression stub
    XYAnchors.ts        Six-anchor bag (left/right/width/top/bottom/height)
    index.ts

  clientAPI/
    index.ts            Client barrel (the public API)
    Presentation.ts     Top-level holder object
    PresentationRoot.ts Structural root; owns sections; defines coordinate space
    LayoutManager.ts    Manages layouts and layout switching
    Layout.ts           Layout interface + LayoutOptions
    LayoutPicker.ts     Selects active layout based on physical viewport size
    Section.ts          Horizontal slice; owns elements
    Element.ts          Base for all content items
    elements/
      MarkdownElement.ts
      BitmapImageElement.ts
      SVGImageElement.ts

  viewAPI/
    index.ts            View barrel (re-exports clientAPI + view interfaces)
    LayoutTransform.ts  { scale, tx } — isotropic scale + horizontal centering
    PresentationView.ts View-side root interface + PresentationViewFactory type
    PresentationViewOwner.ts  Privileged model surface for presentation view
    SectionView.ts      View-side section interface; factory for element views
    SectionViewOwner.ts Privileged model surface for section view
    ElementView.ts      View-side element interface (common to all element types)
    ElementViewOwner.ts Base + three subtype owners in one file

  core/
    AnchoredObjectBase.ts   Shared geometry base for Core* classes
    CorePresentation.ts     implements Presentation + PresentationViewOwner
    CorePresentationRoot.ts implements PresentationRoot
    CoreLayoutManager.ts    implements LayoutManager
    CoreLayout.ts           implements Layout
    CoreSection.ts          implements Section + SectionViewOwner
    CoreElement.ts          Abstract base; implements ElementViewOwner
    elements/
      CoreMarkdownElement.ts
      CoreBitmapImageElement.ts
      CoreSVGImageElement.ts
    nullView/
      NullPresentationView.ts   No-op view (used before attachView is called)
      NullSectionView.ts
      NullElementView.ts
```

## Document Tree

```
Presentation                  Top-level holder (entry point)
  .root: PresentationRoot     Structural root; origin of virtual coordinate space
    .sections: Section[]      Vertical slices, stacked top-to-bottom
      .elements: Element[]    Content items positioned in global coordinates
  .layout: LayoutManager      Manages layouts and which is active
```

`Presentation` is the entry point. It holds the document tree (`root`) and the
layout system (`layout`) as separate sub-objects, each with a single clear role.

Navigation is single-hop only: `section.root` reaches `PresentationRoot`;
`element.section` reaches `Section`. No convenience multi-hop shortcuts are
provided on the public interfaces — they tend to become load-bearing and resist
future change.

## Geometry and Anchors

All geometry is expressed in **presentation units** — a virtual coordinate space
whose origin is the top-left of `PresentationRoot`. At render time, this space is
scaled isotropically to fit the physical viewport.

Every anchored object (PresentationRoot, Section, Element) exposes its geometry
through a single `anchors` bag:

```typescript
element.anchors.left; // Anchor (not a number)
element.anchors.top; // Anchor
// etc.
```

There are no convenience number getters (`element.left`). To read a value:
`element.anchors.left.value`.

Each axis (horizontal / vertical) obeys a **2-of-3 rule**: exactly two of
(start, end, size) are independently constrained; the third is derived. All three
are always readable — there are no nulls.

Anchors form a directed acyclic graph. Circular dependencies are rejected at
the point the expression is set.

### Anchor system design

The anchor system is a port of the p3 anchor system with two significant additions:
inspectability and the `XYAnchors` bag. The p3 tests at
`packages/presentation3/src/anchors/tests/AnchorBehavior.test.ts` are the
authoritative behavioural spec and should be ported to p4 as part of implementing
the system.

**Key types** (`src/anchors/`):

- `Anchor` — a node in the constraint DAG with stable identity. It holds an
  `AnchorExpression` (its current computation recipe) and exposes `value: number`
  (computed on demand — there is no cache). Two anchors with the same expression
  are still distinct objects; anchor identity is what the DAG tracks.
- `AnchorExpression` — an immutable, value-typed recipe for computing a number.
  Subtypes: `ConstantAnchorExpression`, `OffsetAnchorExpression`,
  `FractionAnchorExpression`, `DerivedAnchorExpression`.

**`Anchor` and `AnchorExpression` are not interchangeable.** An `Anchor` is a DAG
node; an `AnchorExpression` is the formula attached to a node. Do not pass an
`Anchor` where an `AnchorExpression` is expected. To reference another anchor's
value inside an expression, wrap it:

```typescript
// Correct — offsetFrom creates an AnchorExpression that reads the anchor's value
section.setVerticalAnchors({
  top: constant(0),
  height: offsetFrom(root.viewportHeight, 0),
});

// Wrong — Anchor is not an AnchorExpression; will fail at runtime
// section.setVerticalAnchors({ top: constant(0), height: root.viewportHeight });
```

- `XYAnchors` — a grouped bag of six anchors (`left`, `right`, `width`, `top`,
  `bottom`, `height`). Exposed on every anchored object. The bag enforces the
  2-of-3 rule per axis.

**2-of-3 rule in detail**: for each axis, exactly two anchors carry an independent
expression; the third is derived from them. The rule is enforced when expressions
are set on the bag, not per-anchor. Attempting to set all three, or fewer than
two, should throw.

**Identity semantics**: `Anchor` instances are stable references. The model holds
anchors by reference and other anchors can depend on them by reference. Replacing
an anchor's expression does not change its identity — dependents automatically
recompute when the expression changes.

**DAG enforcement**: circular dependencies (A depends on B depends on A) must be
detected and thrown at the time the dependency is introduced, not at evaluation
time. Evaluation order is derived from the DAG.

**Inspectability** (first-class for future GUI editor): `Anchor` exposes:

- `expression: AnchorExpression` — the current recipe (type and parameters visible)
- `dependencies: readonly Anchor[]` — anchors this one reads from
- `dependents: readonly Anchor[]` — anchors that read from this one

These allow a future editor to display the constraint graph and let users edit
expressions visually.

**`AnchoredObjectBase`** (`src/core/AnchoredObjectBase.ts`) is the shared base
for `CorePresentationRoot`, `CoreSection`, and all element types. Once the concrete
anchor classes exist it should:

- Own an `XYAnchors` instance
- Expose it via `get anchors(): XYAnchors`
- Provide protected helpers for initialising axis constraints (e.g.
  `setHorizontalAnchors({ left, width })`) consistent with the 2-of-3 rule

## View Lifecycle

The model tree can be fully constructed and have anchor constraints configured
without any renderer present. All objects start with a null view.

```
createPresentation()
  → CorePresentation owns NullPresentationView

presentation.root.addSection()
  → CoreSection starts with NullSectionView

section.addMarkdownElement()
  → CoreMarkdownElement starts with NullElementView

presentation.attachView(factory)          ← explicit step, top-down cascade
  → destroys NullPresentationView
  → factory(owner) → real PresentationView
  → each section: presentationView.createSectionView(section)
  → each element: sectionView.create*ElementView(element)
  → performLayout(view.width, view.height)

view calls owner.notifyViewResized(w, h)  ← on subsequent resizes
  → CorePresentation.performLayout(w, h)
  → layout transform pushed down to all views
```

## View Bridge (viewAPI)

The viewAPI defines two sides of the model↔view seam:

**View interfaces** — what view implementations must provide:

- `PresentationView`, `SectionView`, `ElementView`
- `PresentationViewFactory = (owner: PresentationViewOwner) => PresentationView`

**ViewOwner interfaces** — privileged model surface exposed to views:

- `PresentationViewOwner extends Presentation` — adds `layoutTransform` (read) and `notifyViewResized` (callback)
- `SectionViewOwner extends Section` — adds `presentationViewOwner` for upward navigation
- `ElementViewOwner extends Element` — adds `sectionViewOwner` for upward navigation
- `MarkdownElementViewOwner`, `BitmapImageElementViewOwner`, `SVGImageElementViewOwner` — combine the base owner with the type-specific content interface

ViewOwner interfaces use comment headers to distinguish the two communication
directions:

```typescript
// ── Information the view reads ──
// ── Callbacks the view makes into the model ──
```

## Design Principles

- **No nulls** — the API never returns null or undefined. Optionality is expressed via boolean guards (`hasLayoutPicker`) + throwing getters, or by restructuring so absence cannot occur.
- **No convenience duplicates** — the same information is not exposed two ways.
- **Owning a value ≠ providing a mutator** — an interface only exposes setters where the caller is expected to drive that geometry. Section exposes Y-axis mutation; X-axis is system-managed and read-only from client code.
- **Single-hop navigation** — back-references stop at the nearest structural parent. Multi-hop shortcuts are not added until there is a clear need, because they tend to become fixed and resist future change.
- **Defending against Murphy, not Machiavelli** — the boundaries exist to make the right usage obvious, not to prevent determined misuse. viewAPI is accessible to anyone who wants to write a custom renderer; the contract and stability guarantees are just different.
