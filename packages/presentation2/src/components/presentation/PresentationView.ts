import { Presentation } from "./Presentation";

export interface PresentationConnection {
  connectedPresentation(): Presentation;
}

export interface PresentationView {
  connect(connection: PresentationConnection): void;

  disconnect(): void;
}
