import type {
  Presentation,
  PresentationOptions,
} from "./clientAPI/Presentation";
import { CorePresentation } from "./core/CorePresentation";

/** Creates a new RippleDoc presentation. */
export function createPresentation(
  options?: PresentationOptions,
): Presentation {
  return new CorePresentation(options);
}
