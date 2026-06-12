/**
 * The transform applied to all views during a layout pass.
 *
 * Presentation coordinates are mapped to physical pixels using isotropic scaling:
 * a single scale factor preserves aspect ratio, and tx centres the presentation
 * horizontally in the physical viewport when the aspect ratios differ.
 *
 * Views receive this value on every layout call and use it to position and size
 * their DOM elements (or equivalent).
 */
export interface LayoutTransform {
  /** Presentation units → physical pixels. */
  scale: number;

  /** Horizontal translation in physical pixels to centre the presentation. */
  tx: number;
}
