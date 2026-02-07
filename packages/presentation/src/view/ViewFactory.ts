import type { Presentation } from "../Presentation";
import type { Section } from "../Section";
import type { Element } from "../Element";
import type { PresentationView } from "./PresentationView";
import type { SectionView } from "./SectionView";
import type { ElementView } from "./ElementView";

/**
 * Factory for creating view instances for the presentation model.
 *
 * Concrete implementations can render to different targets (e.g. DOM,
 * canvas, custom renderers) while sharing the same presentation model.
 */
export interface ViewFactory {
	createPresentationView(presentation: Presentation): PresentationView;
	createSectionView(section: Section): SectionView;
	createElementView(element: Element): ElementView;
}
