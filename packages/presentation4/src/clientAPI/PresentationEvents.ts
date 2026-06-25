import type { Section } from "./Section";
import type { Element } from "./Element";
import type { MarkdownElement } from "./elements/MarkdownElement";
import type { BitmapImageElement } from "./elements/BitmapImageElement";
import type { SVGImageElement } from "./elements/SVGImageElement";
import type { PresentationRoot } from "./PresentationRoot";
import type { Layout } from "./Layout";
import type { Pin } from "./animation/Pin";
import type { KeyFrameAnimation } from "./animation/KeyFrameAnimation";
import type { NamedElementStyle } from "./styles/NamedElementStyle";
import type { NamedSectionStyle } from "./styles/NamedSectionStyle";
import type { ScrollTrigger } from "./ScrollTrigger";

export type PresentationEvents = {
  "section:added": { section: Section; index: number };
  "section:removed": { section: Section; index: number };
  "element:added": { element: Element; section: Section; index: number };
  "element:removed": { element: Element; section: Section; index: number };
  "element:markdownChanged": { element: MarkdownElement; markdown: string };
  "element:srcChanged": {
    element: BitmapImageElement | SVGImageElement;
    src: string;
  };
  "element:altChanged": { element: BitmapImageElement; alt: string };
  /**
   * Emitted when an object's anchor expressions are updated, and for every object
   * whose anchor values are transitively affected via the dependency graph.
   */
  "anchors:changed": {
    target: PresentationRoot | Section | Element | ScrollTrigger;
  };
  /** Emitted when a scroll trigger is added to the presentation. */
  "trigger:added": { trigger: ScrollTrigger; index: number };
  /** Emitted when a scroll trigger's name changes. */
  "trigger:nameChanged": { trigger: ScrollTrigger; name: string };
  "layout:added": { layout: Layout };
  "layout:activeChanged": { layout: Layout };
  "element:pinAdded": { element: Element; pin: Pin };
  "element:animationAdded": { element: Element; animation: KeyFrameAnimation };
  "section:animationAdded": { section: Section; animation: KeyFrameAnimation };
  "animation:keyFramesChanged": { animation: KeyFrameAnimation };
  /** Emitted when an element's computed style changes for any reason. */
  "element:styleChanged": { element: Element };
  /** Emitted when a section's computed style changes for any reason. */
  "section:styleChanged": { section: Section };
  "section:nameChanged": { section: Section; name: string };
  "element:nameChanged": { element: Element; name: string };
  /** Emitted when a named element style is added to the registry. */
  "style:elementStyleCreated": { style: NamedElementStyle };
  /** Emitted when a named element style is removed from the registry. */
  "style:elementStyleDeleted": { style: NamedElementStyle };
  /**
   * Emitted when a named element style is renamed. The style object already
   * carries the new name (consistent with `section:nameChanged`).
   */
  "style:elementStyleRenamed": { style: NamedElementStyle };
  /** Emitted when a named section style is added to the registry. */
  "style:sectionStyleCreated": { style: NamedSectionStyle };
  /** Emitted when a named section style is removed from the registry. */
  "style:sectionStyleDeleted": { style: NamedSectionStyle };
  /** Emitted when a named section style is renamed. */
  "style:sectionStyleRenamed": { style: NamedSectionStyle };
};

/**
 * The public event API surface exposed on Presentation.events.
 *
 * on() returns an unsubscribe function. Mode controls apply to all emissions:
 *   beginSession / endSession — buffer events during a batch edit, emit all on end
 *   withEventsDisabled        — suppress all events during the callback (e.g. bulk init)
 */
export interface PresentationEventSource {
  on<K extends keyof PresentationEvents>(
    event: K,
    listener: (payload: PresentationEvents[K]) => void,
  ): () => void;
  beginSession(): void;
  endSession(): void;
  withEventsDisabled(fn: () => void): void;
}
