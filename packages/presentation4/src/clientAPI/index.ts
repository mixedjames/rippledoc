/**
 * clientAPI — the public client interface set for presentation4.
 *
 * This module defines the contract that consumers of the presentation4 package
 * program against. Everything here is a pure interface — no concrete classes,
 * no view mechanics, no implementation details.
 *
 * The three top-level objects a client works with are:
 *
 *   Presentation       The entry point. Holds the document root and the layout
 *                      manager. Created via createPresentation() (not exported
 *                      here — it lives with the concrete implementation).
 *
 *   PresentationRoot   The structural root of the document tree. Owns sections
 *                      and defines the virtual coordinate space. Reached via
 *                      Presentation.root.
 *
 *   Section / Element  The content hierarchy. Sections stack vertically inside
 *                      PresentationRoot; elements are owned by sections but
 *                      positioned in the global virtual coordinate space.
 *
 * View implementations do not import from here directly — they use viewAPI,
 * which re-exports these types alongside the view bridge interfaces.
 */

export type { Anchor, AnchorExpression, XYAnchors } from "../anchors/index";
export type { Presentation, PresentationOptions } from "./Presentation";
export type { PresentationRoot } from "./PresentationRoot";
export type { LayoutManager } from "./LayoutManager";
export type { Layout, LayoutOptions } from "./Layout";
export type { LayoutPicker } from "./LayoutPicker";
export type { Section } from "./Section";
export type { Element, ContentDependentDimension } from "./Element";
export type { MarkdownElement } from "./elements/MarkdownElement";
export type { BitmapImageElement } from "./elements/BitmapImageElement";
export type { SVGImageElement } from "./elements/SVGImageElement";
export type {
  PresentationEvents,
  PresentationEventSource,
} from "./PresentationEvents";
export type {
  ScrollTrigger,
  ScrollTriggerEvents,
  ScrollTriggerOptions,
} from "./ScrollTrigger";
export type { SubComponentTarget } from "./animation/SubComponentTarget";
export type { KeyFrame } from "./animation/KeyFrame";
export type { Animation } from "./animation/Animation";
export type {
  KeyFrameAnimation,
  KeyFrameAnimationOptions,
} from "./animation/KeyFrameAnimation";
export type { Pin } from "./animation/Pin";
export type { SectionAnimations } from "./animation/SectionAnimations";
export type { ElementAnimations } from "./animation/ElementAnimations";
export type {
  Color,
  Fill,
  StyleValue,
  BorderEdgeStyle,
  Border,
  ComputedBorder,
  FontWeight,
  ElementStyleProps,
  ComputedElementStyle,
  SectionStyleProps,
  ComputedSectionStyle,
  StyleRegistry,
} from "./styles/index";
export {
  SYSTEM_DEFAULT_ELEMENT_STYLE,
  SYSTEM_DEFAULT_SECTION_STYLE,
} from "./styles/index";
export type { PresentationMemento } from "./serialize/index";
