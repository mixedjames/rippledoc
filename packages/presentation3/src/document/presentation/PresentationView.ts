import { Presentation } from "./Presentation";

/**
 * An ElementView allows an Element to be rendered.
 */
export interface PresentationView {
  destroy(): void;
}

export class NullPresentationView implements PresentationView {
  destroy(): void { }
}

/**
 * A PresentationViewOwner is a privileged interface that provides additional methods on
 * Presentation that are required by PresentationView implementations.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PresentationViewOwner extends Presentation {
}
