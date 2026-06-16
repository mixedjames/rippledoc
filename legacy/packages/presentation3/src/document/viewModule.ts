/**
 * This module exposes the public API for views.
 *
 * The intention is that view implementations will have a single import label at the top of
 * their files:
 * ```
 * import * as p3 from "../document/viewModule";
 * ```
 *
 * This has a number of benefits:
 * - It makes it clear that the file is using the public API for views.
 * - It packages the public API for views into a namespace avoiding name conflicts with other
 *   modules. (e.g. Element)
 */
export {
  BitmapImageElementViewOwner,
  ElementView,
  ElementViewOwner,
  MarkdownElementViewOwner,
  SVGImageElementViewOwner,
} from "./element/ElementView";
export {
  PresentationView,
  PresentationViewOwner,
} from "../document/presentation/PresentationView";
export { SectionView, SectionViewOwner } from "../document/section/SectionView";
