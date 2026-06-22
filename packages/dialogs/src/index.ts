/**
 * dialogs — public package entry point.
 *
 * Exports the client-facing interface types and the factory function.
 * Concrete implementation classes are intentionally not exported.
 */
export type * from "./clientAPI/index";
export { createDialogs } from "./createDialogs";
