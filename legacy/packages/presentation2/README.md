# @rippledoc/presentation2

A refactor of my original design, learning some lessons along the way.

## Component Orientated Design

In version 1 we organised the project along fairly classical MVC lines. There was a package for:

- The presentation model itself
- The various builders that bootstrapped a presentation object
- A separate project for each renderer

Conceptually this seemed nice - good separation of responsibility. In practice it added a
significant cognitive burden to development. To add a feature you have to add model support,
add builder and XML reader support, and then render it. There's no getting away from that.

In my original design the code for a single change ended up spread over three packages. It was
mentally challenging to know if you'd done each step for every change. And because most edits were
feature additions or alterations, most edits had this cost.

In the new design we group by component. Taking Element as an example: in a single folder you will
now find the model, the builder, and the rendered. If its to do with Elements, it lives there. If
I do end up wanting more structure, I can add subdirectories.

## Object Model Builder Pattern

My original builder pattern was getting very complicated with lots of runtime phase checks etc.

We now have a 3 class model:

1. _Builder_
2. _Compiler_
3. _Object_

## Terminology regarding model relationships

In version 1 we used the language of parents and children a lot. Objects tended to have a single
parent and that tended to be durable in the face of evolving design - great. Children were not so
simple. Objects often had multiple types of children, so what to call them? childrenA* and
childrenB*? It got confusing.

Additionally, although parents were stable, in a multi-level hierarchy each level had a parent
of a different type: elements had sections, and sections had presentations. And the APIs were,
obviously and necessarily, different.

Finally, the immediate parent wasn't always the most useful one.

In the new model we never use parent/child terminology although the relationship is the same.
Instead we call parents what they are:

- Element exposes: .section and .presentation
- Section exposed: .presentation
