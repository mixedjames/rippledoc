# Geometry v1 Decisions for @rippledoc/presentation3

This document records finalized implementation decisions for geometry v1 and is intended to be read alongside `plan.md`.

## Scope

- Full source rework of `presentation3` geometry.
- Existing `dist` artifacts are non-authoritative and ignored for compatibility.
- Content-dependent anchors are deferred for v1, while leaving extension points in place.

## API Direction

- API may evolve beyond the draft in `example-useage.md`.
- Public names are clean: `Presentation`, `Section`, `Element`.
- Documentation should recommend namespace imports in consumers to avoid collisions with global names.

## Constraint Semantics

- Each axis must be constrained by exactly two values per update call:
  - Horizontal: `left`, `right`, `width`
  - Vertical: `top`, `bottom`, `height`
- The third value is always derived.
- Partial or over-complete axis updates are invalid.

## Validation Policy

- Fail fast with explicit thrown errors.
- Reject under-specified and over-specified axis updates.
- Reject cyclical anchor dependencies.
- Apply axis changes atomically only after validation succeeds.

## Expressions and Inspection

- v1 uses expression-based anchor composition.
- v1 includes constants, offsets, fractions, and centering expressions.
- Centering helpers are expression-only in v1.
- Convenience paired-anchor mutation helpers are intentionally deferred.
- Expression inspection in v1 is visitor-only.

## Defaults

- Section and element defaults use fixed percentages/constants from the current design docs.
- Configurable defaults are deferred.

## Verification Priorities

- Axis derivation correctness.
- Cycle detection for direct and indirect loops.
- Stable anchor identity semantics.
- Behavior tests mirroring representative usage flows.
