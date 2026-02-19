/** @packageDocumentation
 *
 * Presentation model and construction APIs.
 *
 * ## Core model (immutable)
 *
 * The core document graph is immutable once built:
 * - Presentation → Section → Element form a fixed tree.
 * - Layout intent is expressed via Expressions on Section/Element.
 * - Each node holds a base Style snapshot that does not change after
 *   construction.
 *
 * Consumers should treat these types as value-like; changes to the
 * document are performed by rebuilding via builders or XML, not by
 * mutating existing instances.
 *
 * ## Runtime state and transforms (mutable)
 *
 * Runtime animation and interaction are modelled as lightweight
 * transform objects attached to the immutable graph:
 * - SectionTransform for section-level effects (e.g. parallax).
 * - ElementTransform for per-element transforms.
 *
 * These transforms are created lazily via explicit flags (e.g.
 * `animated`) to avoid unnecessary allocations for static content.
 * Views are responsible for combining layout, geometry and transform
 * state into concrete rendering.
 *
 * ## Builders
 *
 * Builder types (PresentationBuilder, SectionBuilder, ElementBuilder,
 * ScrollTriggerDescriptorBuilder) capture construction-time intent and
 * enforce layout invariants before producing immutable model instances.
 *
 * ## XML construction (fromXML)
 *
 * The `presentationFromXML` helper builds a Presentation from an XML
 * description, using the same builders under the hood to ensure the
 * same invariants and layout rules apply.
 *
 * ## Views
 *
 * View interfaces (PresentationView, SectionView, ElementView) and
 * ViewFactory decouple the presentation model from any particular
 * rendering technology (e.g. DOM, canvas). Implementations are free to
 * interpret transforms and styles as appropriate for their targets.
 */

// Presentation DOM
export { Presentation } from "./Presentation";
export { PresentationGeometry } from "./PresentationGeometry";
export { Section } from "./Section";
export { Element } from "./Element";
export { ImageElement, ImageFit } from "./ImageElement";
export { SectionTransform } from "./SectionTransform";
export { ElementTransform } from "./ElementTransform";

export { Style } from "./Styles";

// Builder API
export { PresentationBuilder } from "./builder/PresentationBuilder";
export { SectionBuilder } from "./builder/SectionBuilder";
export { ElementBuilder } from "./builder/ElementBuilder";
export { ScrollTriggerDescriptorBuilder } from "./builder/ScrollTriggerDescriptorBuilder";

// XML reader
export { presentationFromXML } from "./fromXML/PresentationFromXML";

// View API
export type { PresentationView } from "./view/PresentationView";
export type { SectionView } from "./view/SectionView";
export type { ElementView } from "./view/ElementView";
export type { ViewFactory } from "./view/ViewFactory";
export type { PresentationDisplay } from "./PresentationDisplay";
export { NullViewFactory, nullViewFactory } from "./view/NullViewFactory";
