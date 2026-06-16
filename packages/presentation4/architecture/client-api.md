# clientAPI — Authoring a Presentation

This document covers the public API available to presentation authors — everything
importable from `@rippledoc/presentation4`. It is intentionally example-first:
read the code blocks, then the prose that follows to understand the rules behind
them.

---

## A minimal presentation

```typescript
import {
  createPresentation,
  constant,
  offsetFrom,
} from "@rippledoc/presentation4";

const presentation = createPresentation({ basisWidth: 1000, basisHeight: 800 });

const vh = presentation.root.viewportHeight; // Anchor — tracks physical viewport height

const s1 = presentation.root.addSection();
s1.setVerticalAnchors({ top: constant(0), height: offsetFrom(vh, 0) });

const s2 = presentation.root.addSection();
s2.setVerticalAnchors({
  top: offsetFrom(s1.anchors.bottom, 0),
  height: offsetFrom(vh, 0),
});

const title = s1.addMarkdownElement("# Hello World");
title.setHorizontalAnchors({ left: constant(60), width: constant(880) });
title.setAutoHeight({ top: offsetFrom(s1.anchors.top, 30) });
```

The coordinate space is expressed in **presentation units** (the `basisWidth` /
`basisHeight` numbers). At render time the space is scaled isotropically to fit the
physical viewport — authors work in logical units, never pixels.

---

## Document hierarchy

```
Presentation
  .root: PresentationRoot     Virtual coordinate space origin; owns sections
    .sections: Section[]      Vertical slices stacked top-to-bottom
      .elements: Element[]    Content items, positioned in global coordinates
  .layout: LayoutManager      Layout definitions and active-layout selection
```

**`Presentation`** is the entry point and a thin holder. It owns `root` and
`layout` as separate sub-objects; it has no geometry of its own.

**`PresentationRoot`** defines the coordinate space. Its `anchors` bag is the
reference point everything else builds on (elements reference its `viewportWidth`,
`viewportHeight`, etc.). Sections are added here: `root.addSection()`.

**`Section`** is a horizontal slice that spans the full width of the canvas. Only
its vertical extent is author-controlled — horizontal geometry is managed by the
system. Sections are stacked in insertion order; it is the author's responsibility
to chain their `top` anchors so they abut (the typical pattern: next section's
`top: offsetFrom(previous.anchors.bottom, 0)`).

Elements inside a section are positioned in **global** presentation coordinates,
not relative to the section. `element.anchors.top` is a distance from the top of
`PresentationRoot`, not from the section's top. Reference the section's own anchors
explicitly when you want section-relative positioning:

```typescript
// 30 units below the section's top — anchors are global, but the expression
// references s1.anchors.top so the position tracks the section.
title.setAutoHeight({ top: offsetFrom(s1.anchors.top, 30) });
```

Navigation is single-hop: `section.root` reaches `PresentationRoot`;
`element.section` reaches the owning `Section`. No convenience shortcuts beyond
these.

---

## Geometry — anchors and expressions

Every anchored object (root, section, element) exposes its geometry through an
`anchors` bag with six slots:

```typescript
element.anchors.left; // Anchor
element.anchors.right; // Anchor
element.anchors.width; // Anchor
element.anchors.top; // Anchor
element.anchors.bottom; // Anchor
element.anchors.height; // Anchor
```

Reading a value: `element.anchors.left.value` — not `element.left`.

### Anchors vs. expressions — the critical distinction

**`Anchor`** is a node in a constraint graph. It has stable identity; other anchors
can depend on it by reference. You _read_ from anchors (`anchor.value`,
`anchor.dependencies`, etc.).

**`AnchorExpression`** is an immutable recipe for computing a number. You _write_
expressions — they are what you pass to setters. The three factory functions
produce expressions:

```typescript
constant(100); // always 100
offsetFrom(someAnchor, 50); // someAnchor.value + 50
fractionOf(someAnchor, 0.5); // someAnchor.value * 0.5
```

`Anchor` and `AnchorExpression` are **not interchangeable**. Setters require an
`AnchorExpression`; pass an `Anchor` directly and the call will fail at runtime.
When you want an expression that tracks another anchor's value, always wrap it:

```typescript
// Correct — offsetFrom wraps the Anchor, producing an AnchorExpression
s2.setVerticalAnchors({
  top: offsetFrom(s1.anchors.bottom, 0),
  height: offsetFrom(vh, 0),
});

// Wrong — s1.anchors.bottom is an Anchor, not an AnchorExpression
// s2.setVerticalAnchors({ top: s1.anchors.bottom, height: ... }); // runtime error
```

### The 2-of-3 rule

For each axis (horizontal and vertical), there are three values: start, size, and
end. The constraint graph only needs two to determine all three; supplying all three
would over-constrain it. The rule:

> Provide exactly 2. The third is derived automatically. All three are always
> readable — there are no nulls.

For the **horizontal** axis the three values are `left`, `width`, and `right`:

```typescript
// left + width → right derived as left + width
el.setHorizontalAnchors({ left: constant(50), width: constant(400) });
// el.anchors.right.value === 450

// left + right → width derived as right - left
el.setHorizontalAnchors({ left: constant(50), right: constant(450) });
// el.anchors.width.value === 400

// right + width → left derived as right - width
el.setHorizontalAnchors({ right: constant(450), width: constant(400) });
// el.anchors.left.value === 50
```

The **vertical** axis works identically with `top`, `height`, and `bottom`.

Passing all three, or fewer than two, throws a `GeometryConstraintError`.

Sections are unusual: the system manages their horizontal axis, so only
`setVerticalAnchors` is available on `Section`.

### Viewport anchors

`PresentationRoot` exposes four live anchors that update whenever the physical
viewport is resized:

```typescript
presentation.root.viewportWidth; // Anchor
presentation.root.viewportHeight; // Anchor
presentation.root.viewportLeft; // Anchor  (horizontal centering offset)
presentation.root.viewportRight; // Anchor
```

These are `Anchor` instances — wrap them in an expression factory when setting
other anchors:

```typescript
const vh = presentation.root.viewportHeight;

// Section fills the viewport height — tracks resizes automatically
s1.setVerticalAnchors({ top: constant(0), height: offsetFrom(vh, 0) });

// Trigger active from 30% down the viewport, spanning 70% of it
const trigger = presentation.addScrollTrigger({
  top: fractionOf(vh, 0.3),
  height: fractionOf(vh, 0.7),
});
```

### Content-dependent dimensions

When an element's size on one axis is determined by its rendered content (e.g. a
markdown block whose height depends on how the text wraps), use an `setAuto*` call
instead of providing both constraints on that axis:

```typescript
// Provide only the start anchor; height is measured by the view and fed back
el.setAutoHeight({ top: offsetFrom(s1.anchors.top, 30) });
// el.anchors.bottom.value updates after the view measures the rendered height

// Symmetric for width
el.setAutoWidth({ left: constant(60) });
```

Only one axis can be content-dependent. The other must be fully constrained with
two values.

---

## Content types

Three element types are available:

```typescript
// Rendered markdown
const md = section.addMarkdownElement("# Heading\n\nBody text.");
md.setMarkdown("Updated text."); // mutate later

// Raster image
const img = section.addBitmapImageElement();
img.setSrc("images/photo.jpg");
img.setAlt("A photo");

// SVG image — supports sub-component animation targeting
const svg = section.addSVGImageElement();
svg.setSrc("images/diagram.svg");
```

All three extend the base `Element` interface and therefore require both horizontal
and vertical anchors (or `setAuto*` for one axis).

---

## Scroll triggers

A scroll trigger defines a vertical range in presentation units and fires events as
the current scroll position crosses its boundaries:

```typescript
const trigger = presentation.addScrollTrigger({
  name: "Chapter 1", // optional, shown in editor HUD
  top: offsetFrom(s2.anchors.top, 0),
  height: offsetFrom(s2.anchors.height, 0),
});

trigger.on("start", ({ progress }) => {
  /* entered from above, scrolling down */
});
trigger.on("scroll", ({ progress }) => {
  /* moved within the range */
});
trigger.on("end", ({ progress }) => {
  /* exited downward */
});
trigger.on("reverseStart", ({ progress }) => {
  /* re-entered from below, scrolling up */
});
trigger.on("reverseEnd", ({ progress }) => {
  /* exited upward */
});
```

`progress` is 0–1, where 0 is the top of the trigger range and 1 is the bottom.
Triggers obey the 2-of-3 rule on their vertical axis (horizontal is always 0).

---

## Animation (introduction)

Animations are attached to elements and sections. Full coverage is in a separate
document; the two kinds to know about:

**Pins** — hold an element fixed on screen while the viewport scrolls through a
trigger range. The view clones the element, positions it absolutely at its initial
on-screen position, and releases it when the trigger ends:

```typescript
const pinTrigger = presentation.addScrollTrigger({
  top: offsetFrom(svgEl.anchors.top, 0), // pin starts when element reaches viewport top
  height: offsetFrom(s3.anchors.height, 0), // hold for the full height of s3
});
svgEl.animations.addPin(pinTrigger);
```

**Keyframe animations** — interpolate CSS properties over a trigger range. Setting
`scrollDriven: true` ties animation time directly to scroll position (scrubbing):

```typescript
const anim = el.animations.addKeyFrameAnimation({
  trigger,
  duration: 1000,
  scrollDriven: true,
  keyFrames: [
    { position: 0, opacity: 0, transform: "translateY(40px)" },
    { position: 1000, opacity: 1, transform: "translateY(0px)" },
  ],
});
```

SVG elements support sub-component targeting — animate a single element within
the SVG by selector:

```typescript
const circleTarget = svg.subComponent("#my-circle");
svg.animations.addKeyFrameAnimation({ trigger, target: circleTarget, ... });
```

---

## Layouts (introduction)

Layouts let you define alternate basis dimensions for different viewport shapes
(e.g. portrait vs. landscape). Each layout gets its own set of anchor values; the
active layout is swapped atomically. Full coverage is in a separate document.

```typescript
const landscape = presentation.layout.defaultLayout; // created at construction time
const portrait = presentation.layout.addLayout({
  basisWidth: 800,
  basisHeight: 1000,
});

presentation.layout.setActiveLayout(portrait); // all anchors update at once

// Optionally, install an automatic picker
presentation.layout.setLayoutPicker({
  pickLayout(physicalWidth, physicalHeight, layouts) {
    return physicalWidth >= physicalHeight ? landscape : portrait;
  },
});
```

---

## Attaching a renderer and serialisation

The model tree can be fully built before a renderer is attached — all objects start
with a null (no-op) view:

```typescript
// Build the full model first...
const presentation = createPresentation(...);
// ...add sections, elements, triggers, animations...

// Then attach a renderer in one call; the view cascades through the tree
presentation.attachView(someViewFactory);

// Serialise to plain JSON at any time
const json = JSON.stringify(presentation.toMemento());
```
