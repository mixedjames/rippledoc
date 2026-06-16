/**
 * Public API for the presentation3 document model.
 *
 * Purpose:
 * - Defines the high-level geometry-bearing objects: `Presentation`, `Section`, and `Element`.
 * - Implements default layout behavior and section/element construction semantics.
 * - Delegates coordinate expression and validation logic to the `anchors` subpackage.
 *
 * Typical usage:
 * @example
 * ```ts
 * import * as p3 from "@rippledoc/presentation3";
 *
 * const presentation = new p3.Presentation({ slideWidth: 1200, slideHeight: 800 });
 * const section = presentation.addSection();
 * const element = section.addElement();
 * ```
 *
 * @example
 * ```ts
 * import * as p3 from "@rippledoc/presentation3";
 *
 * const section = new p3.Presentation().addSection();
 * const element = section.addElement();
 * element.setHorizontalAnchors({
 *   left: p3.offsetFrom(section.leftAnchor, 16),
 *   width: p3.fractionOf(section.widthAnchor, 0.5),
 * });
 * ```
 *
 * Error handling:
 * - Invalid anchor updates propagate `GeometryConstraintError` from the anchors layer.
 * - This includes under-specified or over-specified axis constraints and cyclic dependencies.
 * - Consumers should catch and report these as authoring/validation errors.
 *
 * Developers:
 * - Allowed dependencies:
 *   - Other modules under `document/`.
 *   - Public exports from `anchors/`.
 * - Not allowed dependencies:
 *   - Imports from app/demo layers.
 *   - Rendering/view/UI packages.
 *   - Direct dependency on `anchors/tests` or `document/tests` modules.
 */
export { createPresentation } from "./presentation/Presentation";

export { Presentation } from "./presentation/Presentation";
export { Layout } from "./presentation/Layout";
