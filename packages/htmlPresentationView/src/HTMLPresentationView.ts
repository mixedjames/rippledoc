import type { PresentationView, Presentation } from "@rippledoc/presentation";

/**
 * Skeleton HTML implementation of PresentationView.
 *
 * For now this simply creates a container element under the provided
 * root and exposes no-op layout behaviour. Real rendering and layout
 * can be added incrementally.
 */
export class HTMLPresentationView implements PresentationView {
	private readonly presentation_: Presentation;
	private readonly root_: HTMLElement;
	private container_: HTMLElement | null = null;
	private backgroundsContainer_: HTMLElement | null = null;
	private elementsContainer_: HTMLElement | null = null;

	constructor(options: { presentation: Presentation; root: HTMLElement }) {
		this.presentation_ = options.presentation;
		this.root_ = options.root;
	}

	realise(): void {
		if (this.container_) {
			return;
		}

		const container = document.createElement("div");
		container.className = "presentation-root";
		container.style.position = "relative";

		const backgrounds = document.createElement("div");
		backgrounds.className = "backgrounds";

		const elements = document.createElement("div");
		elements.className = "elements";

		container.appendChild(backgrounds);
		container.appendChild(elements);
		this.root_.appendChild(container);

		this.container_ = container;
		this.backgroundsContainer_ = backgrounds;
		this.elementsContainer_ = elements;
	}

	layout(): void {
		if (!this.container_) {
			throw new Error("HTMLPresentationView.layout() called before realise()");
		}
	}

	/** Root container element for this presentation, created during realise(). */
	get container(): HTMLElement | null {
		return this.container_;
	}

	/** Container that holds stacked section background elements. */
	get backgroundsContainer(): HTMLElement | null {
		return this.backgroundsContainer_;
	}

	/** Container that holds section content elements (and their child elements). */
	get elementsContainer(): HTMLElement | null {
		return this.elementsContainer_;
	}
}

