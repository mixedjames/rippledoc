# Expressions

Imagine a system of shapes on the screen. The borders of each shape are defined by short,
simple equations. You can specify some combination of left, right and width for the x
axis, and top, bottom and height for the y axis. These equations might make reference to the borders of other shapes.

This leads to a set of expressions. They must be sorted into an order where expressions without dependencies are evaluated before those that depend on them. It also important to detect whether
any cycles have been created:

```
x = 2*y
y = x/2
```
These can't be evaluated by an imperitive system. But, we don't need them. We must detect them - if
we don't evaluation of an expression could easily spiral into an infinite loop.

These are the problems this package aims to solve.

## How I solved the problem

I split the problem into phases:

### Phase 1: Parsing all the equations (unbound phase)

In this phase we simply parse everything. Each expression is turned into an in-memory representation
of the equation. Names (e.g. x, y, this) are remembered, but **not** looked up. (*This is key*)

We also remember the name of every equation we find and parse.

I've created two names for these objects:
- Unbound expressions: *expressions that have been parsed but whose names have not yet been looked up*
- Binding context: *a map of names of expressions to the unbound expression they represent*

### Phase 2: Looking up names (binding phase)

By the start of this phase we know:
- The names of every available expression in the system
- The structure of every expression in the system

Binding involves looking up any dependencies in the binding context. The binding context yields a
function who will, once binding is complete, yield an so-called dependent equation.

Every equation must be given an opportunity to bind.

Bound equations cannot yet be evaluated however - they might still contain cycles.

At the end of phase 2, binding, we have:
- Any dependencies in the equations in the system have been converted from simple names
  to functionds yielding dependent expressions

An important concept at this point is the **dependent expression** - these:
- Cannot yet be executed
- Know a list of their dependencies
- Remember whether they have been resolved
- Can check whether their immediate dependencies have themselves been resolved

### Phase 3: Resolving order dependencies (resolving phase)

During this phase expressions are sorted so that expressions with dependencies always appear later
in the list that those depdencies themseleves.

I'll defer discussing the algorithm used by Resolver.js until an appendix.

Resolution is not actually needed to evaluate expressions - in theory binding allows expressions to
directly evaluate their dependencies. However, **resolving detects cycles**.

Only after resolving is it **safe to evaluate expressions**.

## How I expressed this in JavaScript

A key aim was making it impossible (or at least difficult) to build an expression set that was
unsafe. To that end, each phase is expressed as a type:
- UnboundExpression
- DependentExpression
- Expression

The underlying expression structure (as an AST internally) moves from one structure to the next
via transforming functions.

Note that it is a **logical move** operation - each type becomes invalid after the transform operation. You cannot, for example, bind an UnboundExpression to many different contexts.

Each form keeps a reference to the next phase type: UnboundExpression has .dependentExpression
and DependentExpression has .expression.

```
// Phase 1
const unboundExpression1 = parseExpression('42');
const unboundExpression2 = parseExpression('a+1');

// Names are defined via BindingContext
const ctx = new BindingContext();
ctx.addExpression('a', NameType.VALUE, unboundExpression1);
ctx.addExpression('b', NameType.VALUE, unboundExpression2);

// Phase 2
const dependentExpressions = 
  [unboundExpression1, unboundExpression2].forEach((e) => e.bind(ctx));

// Phase 3
const expressions = resolveExpressions(dependentExpressions);
```