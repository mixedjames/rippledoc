import {
  Presentation,
  PhysicalDimensions,
  ContentDependentElement,
} from "./Presentation";

export type ConnectionData = {
  presentation: Presentation;
  sortedContentDependentElements: ContentDependentElement[];
};

export interface PresentationView {
  connect(connectionData: ConnectionData): void;

  disconnect(): void;

  get physicalDimensions(): PhysicalDimensions;
}
