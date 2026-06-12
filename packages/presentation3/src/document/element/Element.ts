/**
 * Element pseudo-module barrel.
 *
 * High-level structure:
 * - `ElementBase.ts` contains the shared public base contract and lifecycle behavior.
 * - `Concrete*Element.ts` files pair each public subtype interface with its internal concrete
 *   implementation.
 * - `ConcreteElement` is a backward-compatible alias of the default markdown element.
 *
 * Architectural boundary:
 * - Client code should depend on `Element` and subtype interfaces (`MarkdownElement`,
 *   `BitmapImageElement`, `SVGImageElement`).
 * - Concrete classes and `*ViewOwner` interfaces are privileged internal seams used by document
 *   and view implementations.
 *
 * Import from this file when you want the public element model API without caring about
 * individual source file locations.
 */
export { ConcreteElementBase, Element } from "./ElementBase";
export {
  BitmapImageElement,
  ConcreteBitmapImageElement,
} from "./ConcreteBitmapImageElement";
export {
  SVGImageElement,
  ConcreteSVGImageElement,
} from "./ConcreteSVGImageElement";
export {
  MarkdownElement,
  ConcreteMarkdownElement,
} from "./ConcreteMarkdownElement";
export { ConcreteElement } from "./ConcreteElement";
