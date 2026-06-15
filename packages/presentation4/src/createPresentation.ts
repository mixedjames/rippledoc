import type {
  Presentation,
  PresentationOptions,
} from "./clientAPI/Presentation";
import type { PresentationMemento } from "./clientAPI/serialize/PresentationMemento";
import type { PresentationViewFactory } from "./viewAPI/PresentationView";
import { CorePresentation } from "./core/CorePresentation";

/**
 * The full public type of a created presentation: all clientAPI methods plus
 * `attachView` for connecting a renderer, and `toMemento` for serialization.
 * Defined here (above both layers) so it can reference both clientAPI and
 * viewAPI types without breaking import rules.
 */
export type ViewablePresentation = Presentation & {
  attachView(factory: PresentationViewFactory): void;
  toMemento(): PresentationMemento;
};

/** Creates a new RippleDoc presentation. */
export function createPresentation(
  options?: PresentationOptions,
): ViewablePresentation {
  return new CorePresentation(options);
}
