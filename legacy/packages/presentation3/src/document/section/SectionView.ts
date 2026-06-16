import { Section } from "./Section";
import { PresentationViewOwner } from "../presentation/PresentationView";
import {
  BitmapImageElementViewOwner,
  ElementView,
  MarkdownElementViewOwner,
  SVGImageElementViewOwner,
} from "../element/ElementView";

/**
 * A SectionView allows a Section to be rendered.
 */
export interface SectionView {
  layout({ scale, tx }: { scale: number; tx: number }): void;

  destroy(): void;

  createBitmapImageElementView(owner: BitmapImageElementViewOwner): ElementView;
  createSVGImageElementView(owner: SVGImageElementViewOwner): ElementView;
  createMarkdownElementView(owner: MarkdownElementViewOwner): ElementView;
}

/**
 * A SectionViewOwner is a privileged interface that provides additional methods on Section
 * that are required by SectionView implementations.
 */
export interface SectionViewOwner extends Section {
  get presentationViewOwner(): PresentationViewOwner;
}
