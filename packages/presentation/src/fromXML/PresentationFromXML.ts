import { resolveExpressions } from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import type { Presentation } from "../Presentation";
import { PresentationBuilder } from "../builder/PresentationBuilder";

/**
 * Build a Presentation from an XML document fetched from the given URL.
 *
 * XML format:
 * <document>
 *   <slideSize w="800" h="600"/>
 *   <section h="expression" b="expression">
 *     <element l="expr" w="expr" t="expr" h="expr"/>
 *   </section>
 * </document>
 *
 * @param url URL of the XML document to load.
 * @param viewFactory Factory for creating view objects.
 */
export async function presentationFromXML(
	url: string | URL,
	viewFactory: ViewFactory,
): Promise<Presentation> {
	// Fetch and parse XML
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch XML: ${response.statusText}`);
	}

	const xmlText = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, "text/xml");

	// Check for parser errors
	const parserError = xmlDoc.querySelector("parsererror");

	if (parserError) {
		throw new Error(`XML parsing error: ${parserError.textContent ?? ""}`);
	}

	// Create builder
	const builder = new PresentationBuilder({ viewFactory });

	// Parse <slideSize>
	const slideSize = xmlDoc.querySelector("slideSize");

	if (!slideSize) {
		throw new Error("Missing required <slideSize> element");
	}

	const width = slideSize.getAttribute("w");
	const height = slideSize.getAttribute("h");

	if (!width || !height) {
		throw new Error("<slideSize> must have both w and h attributes");
	}

	builder.setSlideWidth(Number(width));
	builder.setSlideHeight(Number(height));

	// Parse <section> elements
	const sections = xmlDoc.querySelectorAll("section");

	sections.forEach((sectionEl) => {
		const section = builder.createSection();

		const h = sectionEl.getAttribute("h");
		const b = sectionEl.getAttribute("b");

		// Set whichever is non-empty
		if (h && h.trim() !== "") {
			section.setHeight(h);
		}

		if (b && b.trim() !== "") {
			section.setBottom(b);
		}

		// Parse <element> children
		const elements = sectionEl.querySelectorAll("element");

		elements.forEach((elementEl) => {
			const element = section.createElement();

			const l = elementEl.getAttribute("l");
			const r = elementEl.getAttribute("r");
			const w = elementEl.getAttribute("w");
			const t = elementEl.getAttribute("t");
			const bEl = elementEl.getAttribute("b");
			const hEl = elementEl.getAttribute("h");

			// Set each non-empty attribute
			if (l && l.trim() !== "") {
				element.setLeft(l);
			}

			if (r && r.trim() !== "") {
				element.setRight(r);
			}

			if (w && w.trim() !== "") {
				element.setWidth(w);
			}

			if (t && t.trim() !== "") {
				element.setTop(t);
			}

			if (bEl && bEl.trim() !== "") {
				element.setBottom(bEl);
			}

			if (hEl && hEl.trim() !== "") {
				element.setHeight(hEl);
			}
		});
	});

	// Bind and resolve expressions
	const deps = builder.bindExpressions();
	resolveExpressions(deps);

	// Build and return final Presentation
	return builder.build();
}
