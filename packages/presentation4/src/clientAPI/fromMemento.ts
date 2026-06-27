import type { Presentation } from "./Presentation";
import type { PresentationMemento } from "./serialize/PresentationMemento";
// Deliberate cross-layer import: fromMemento is the factory that reconstructs
// a concrete presentation from a serialized snapshot. Like createPresentation,
// it must reach into core to construct the implementation — the clientAPI layer
// cannot avoid this for factory functions.
import { coreFromMemento } from "../core/deserialize";

/** Reconstruct a presentation from a serialized memento snapshot. */
export function fromMemento(memento: PresentationMemento): Presentation {
  return coreFromMemento(memento);
}
