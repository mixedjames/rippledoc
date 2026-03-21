import {
  Presentation,
  PhysicalDimensions,
  ContentDependentElement,
} from "./Presentation";

export interface PresentationConnection {
  connectedPresentation(): Presentation;

  getSortedContentDependentElements(): ContentDependentElement[];
}

export interface PresentationView {
  connect(connection: PresentationConnection): void;

  disconnect(): void;

  get physicalDimensions(): PhysicalDimensions;
}
