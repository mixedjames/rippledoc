/** @packageDocumentation
 *
 */

// Presentation DOM
export { Presentation } from "./Presentation";
export { Section } from "./Section";
export { Element } from "./Element";
export { ImageElement, ImageFit } from "./ImageElement";

export { Style } from "./Styles";

// Builder API
export { PresentationBuilder } from "./builder/PresentationBuilder";
export { SectionBuilder } from "./builder/SectionBuilder";
export { ElementBuilder } from "./builder/ElementBuilder";
export { ScrollTriggerBuilder } from "./builder/ScrollTriggerBuilder";

// XML reader
export { presentationFromXML } from "./fromXML/PresentationFromXML";

// View API
export type { PresentationView } from "./view/PresentationView";
export type { SectionView } from "./view/SectionView";
export type { ElementView } from "./view/ElementView";
export type { ViewFactory } from "./view/ViewFactory";
export { NullViewFactory, nullViewFactory } from "./view/NullViewFactory";
