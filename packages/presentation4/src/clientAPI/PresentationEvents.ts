import type { Section } from "./Section";
import type { Element } from "./Element";
import type { MarkdownElement } from "./elements/MarkdownElement";
import type { BitmapImageElement } from "./elements/BitmapImageElement";
import type { SVGImageElement } from "./elements/SVGImageElement";
import type { PresentationRoot } from "./PresentationRoot";
import type { Layout } from "./Layout";

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
  "anchors:changed": { target: PresentationRoot | Section | Element };
  "layout:added": { layout: Layout };
  "layout:activeChanged": { layout: Layout };
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
