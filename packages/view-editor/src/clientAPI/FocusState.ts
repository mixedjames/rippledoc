import type { Element } from "@rippledoc/presentation4/viewAPI";

/**
 * Discriminated union describing the current focused-element state.
 *
 * Check `focused` before accessing `element` — TypeScript narrows the type
 * inside the true branch, so the access is always compile-time safe.
 *
 *   const f = controller.selection.focus;
 *   if (f.focused) doSomethingWith(f.element);
 */
export type FocusState =
  | { readonly focused: true; readonly element: Element }
  | { readonly focused: false };
