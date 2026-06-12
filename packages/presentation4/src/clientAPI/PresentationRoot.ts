import type { Section } from "./Section";
import type { XYAnchors } from "../anchors/index";

/**
 * PresentationRoot is the structural root of the document tree and the origin
 * of the global virtual coordinate space.
 *
 * It owns all sections, which are stacked vertically in the order they were
 * added. It also defines the basis size — the virtual canvas dimensions that
 * all element geometry is expressed in. The basis size is scaled isotropically
 * to fit the physical viewport at render time.
 *
 * PresentationRoot is the thing that actually gets rendered. It is reached via
 * Presentation.root.
 */
export interface PresentationRoot {
  /**
   * The anchors defining the root's geometry in the virtual coordinate space.
   *
   * PresentationRoot anchors serve as the reference point for all other geometry
   * in the presentation. Elements and sections are typically anchored relative to
   * these — for example, offsetting from the root's left anchor to apply a margin.
   */
  get anchors(): XYAnchors;

  /**
   * Width of the virtual canvas in presentation units.
   * All horizontal geometry in the presentation is expressed relative to this.
   */
  get basisWidth(): number;

  /**
   * Height of the virtual canvas in presentation units.
   * This represents the visible height at any one scroll position.
   */
  get basisHeight(): number;

  /**
   * Total height of the presentation in presentation units.
   * This is the sum of the heights of all sections.
   */
  get totalHeight(): number;

  /** Appends a new empty section to the bottom of the presentation. */
  addSection(): Section;

  /** Returns all sections in display order, top to bottom. */
  getSections(): readonly Section[];
}
