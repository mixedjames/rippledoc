import "../css/styles.css";

import { presentationFromXML, nullViewFactory, Presentation } from "@rippledoc/presentation";

window.addEventListener("DOMContentLoaded", () => {
	const xmlInput = document.getElementById("xml-input") as
		| HTMLTextAreaElement
		| null;
	const parseButton = document.getElementById("parse-btn") as
		| HTMLButtonElement
		| null;
	const status = document.getElementById("status") as HTMLSpanElement | null;
	const errorOutput = document.getElementById("error-output") as
		| HTMLDivElement
		| null;
	const structureOutput = document.getElementById("structure-output") as
		| HTMLDivElement
		| null;

	if (!xmlInput || !parseButton || !structureOutput || !errorOutput) {
		return;
	}

	if (!xmlInput.value) {
		xmlInput.value = getDefaultXmlExample();
	}

	parseButton.addEventListener("click", () => {
		void handleParseClick({ xmlInput, status, errorOutput, structureOutput });
	});
});

function getDefaultXmlExample(): string {
	return [
		"<document>",
		"  <slideSize w=\"800\" h=\"600\" />",
		"  <section h=\"100\">",
		"    <element l=\"10\" w=\"50\" t=\"10\" h=\"20\" />",
		"    <element l=\"70\" w=\"120\" t=\"40\" h=\"30\" />",
		"  </section>",
		"  <section h=\"200\">",
		"    <element l=\"20\" w=\"60\" t=\"30\" h=\"40\" />",
		"  </section>",
		"</document>",
	].join("\n");
}

async function handleParseClick(options: {
	xmlInput: HTMLTextAreaElement;
	status: HTMLSpanElement | null;
	errorOutput: HTMLDivElement;
	structureOutput: HTMLDivElement;
}): Promise<void> {
	const { xmlInput, status, errorOutput, structureOutput } = options;
	const source = xmlInput.value.trim();

	errorOutput.textContent = "";
	structureOutput.innerHTML = "";
	if (status) {
		status.textContent = "Parsing XML…";
	}

	if (!source) {
		if (status) {
			status.textContent = "Please enter some XML.";
		}
		return;
	}

	try {
		const presentation = await presentationFromXML({
			text: source,
			viewFactory: nullViewFactory,
		});
		renderPresentationStructure(structureOutput, presentation);
		if (status) {
			status.textContent = "Parsed successfully.";
		}
	} catch (err) {
		const message = (err as Error).message ?? "Unexpected error";
		console.error(err);
		errorOutput.textContent = message;
		if (status) {
			status.textContent = "Failed to parse XML.";
		}
	}
}

function renderPresentationStructure(
	container: HTMLDivElement,
	presentation: Presentation,
): void {
	container.innerHTML = "";

	const root = document.createElement("div");
	root.className = "tree-root";

	const header = document.createElement("div");
	header.className = "tree-node presentation-node";
	header.textContent = `Presentation (${presentation.slideWidth} × ${presentation.slideHeight})`;
	root.appendChild(header);

	const sectionsList = document.createElement("ul");
	sectionsList.className = "tree-list sections-list";

	presentation.sections.forEach((section, index) => {
		const sectionItem = document.createElement("li");
		sectionItem.className = "tree-node section-node";

		const title = document.createElement("div");
		title.className = "tree-label";
		const sectionNameSuffix = section.name && section.name.trim() !== ""
			? ` name="${section.name}"`
			: "";
		title.textContent = `Section ${index + 1}:${sectionNameSuffix} top=${section.sectionTop}, height=${section.sectionHeight}, bottom=${section.sectionBottom}`;
		sectionItem.appendChild(title);

		if (section.elements.length > 0) {
			const elementsList = document.createElement("ul");
			elementsList.className = "tree-list elements-list";

			section.elements.forEach((element, elIndex) => {
				const elementItem = document.createElement("li");
				elementItem.className = "tree-node element-node";

				const elLabel = document.createElement("div");
				elLabel.className = "tree-label";
				const nameSuffix = element.name && element.name.trim() !== ""
					? ` name="${element.name}"`
					: "";
				elLabel.textContent = `Element ${elIndex + 1}:${nameSuffix} left=${element.left}, top=${element.top}, width=${element.width}, height=${element.height}, right=${element.right}, bottom=${element.bottom}`;
				
				elementItem.appendChild(elLabel);
				elementsList.appendChild(elementItem);
			});

			sectionItem.appendChild(elementsList);
		}

		sectionsList.appendChild(sectionItem);
	});

	root.appendChild(sectionsList);
	container.appendChild(root);
}
