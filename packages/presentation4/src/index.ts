/**
 * presentation4 — public package entry point.
 *
 * This barrel exports the client-facing API: the interfaces that code consuming
 * a presentation imports to build and navigate the document tree.
 *
 * If you are writing a view implementation (a renderer), import from viewAPI
 * instead — it re-exports everything here plus the view bridge interfaces:
 *
 *   import * as p4 from "@rippledoc/presentation4/viewAPI";
 *
 * The concrete implementation classes (Core*) are intentionally not exported.
 * Use createPresentation() — once available — as the sole entry point for
 * constructing a presentation.
 */
export type * from "./clientAPI/index";
export { createPresentation } from "./createPresentation";
export { constant, offsetFrom, fractionOf } from "./anchors/factories";
