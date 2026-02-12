# Builder–Module–Product Pattern

## Motivation

We want **immutable, simple final objects** (e.g. DOM elements, compiled expressions) while still supporting a **messy, stateful, order-dependent construction process**.

Attempts to model construction as a sequence of "nice" intermediate objects tend to fail:

- Compilation phases leak into places they don’t belong
- Objects represent multiple temporal states via flags or nulls
- APIs become defensive and phase-aware
- Users can observe or misuse partially-valid states

The core insight:

> **Phases are transitions, not values.**

If a thing is beautiful when finished but ugly while forming, users should never see it while forming.

---

## The Pattern

We split responsibilities across three roles:

```
Mutable Builder  ──commit──▶  Compiler / Module  ──create──▶  Immutable Product
```

Each role owns a single concern and a single kind of time.

---

## 1. Builders (Construction Mode)

**Why they exist**

- Final products are immutable
- All construction data must be present at creation time
- Construction is inherently stateful and contextual

**Characteristics**

- Mutable
- Order-dependent
- Can observe siblings / parents
- Can derive or rewrite data
- May be temporarily inconsistent

**What builders do**

- Collect intent (strings, options, relationships)
- Perform structural validation
- Derive missing values
- Coordinate with adjacent builders

**What builders must NOT do**

- Bind expressions
- Resolve dependencies
- Evaluate values
- Expose partially-built products

Builders never model compilation phases. They only model _intent_.

---

## 2. Module / Compiler (Single Transition)

The module owns **all compilation phases internally**.

Examples of hidden phases:

- Parsing
- Name binding
- Dependency graph construction
- Cycle detection
- Finalization

**Public surface**

- Definitions are added
- A single irreversible transition is triggered (e.g. `compile()`)

**Key rules**

- Only one public transition
- No access to intermediate states
- Failure leaves the module unusable (no rollback)

This makes illegal states unrepresentable.

---

## 3. Immutable Product (After Build)

**Characteristics**

- Fully valid
- Fully bound
- Immutable
- Simple API
- No phase awareness

Products never know how they were built.

---

## The Two Real Phases Users See

From an API user’s perspective, there are only two meaningful phases:

### A. Construction Mode

- Builders are mutable
- Relationships and intent are assembled
- Hooks like `elementComplete()` or `sectionComplete()` may run

### B. Building

- A single `build()` / `compile()` call
- Builders become invalid
- Immutable products are created

Everything else is an implementation detail.

---

## Benefits

- Phase leakage is eliminated
- APIs become smaller and more obvious
- Builders are free to be pragmatic and messy
- Compilation complexity is quarantined
- Final objects remain clean and immutable

---

## Guiding Rule

> **Never let users hold something that is only valid at a particular moment in time.**

If time matters, hide it behind a single, irreversible transition.
