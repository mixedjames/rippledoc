/** @packageDocumentation
 *
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
