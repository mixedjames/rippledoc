import {
	createNativeExpression,
	DefaultBindingContext,
	NameType,
	parseExpression,
} from "@expressions";
import type {
	DependentExpression,
	UnboundExpression,
} from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import type { Section } from "../Section";
import { Presentation } from "../Presentation";
import { SectionBuilder } from "./SectionBuilder";

export const Phase = Object.freeze({
	UNBOUND: Symbol("UNBOUND"),
	BINDING: Symbol("BINDING"),
	BOUND: Symbol("BOUND"),
	BUILT: Symbol("BUILT"),
} as const);

export type PhaseType = (typeof Phase)[keyof typeof Phase];

interface SlideLayout {
	widthValue: number;
	heightValue: number;
	widthUnbound: UnboundExpression | null;
	heightUnbound: UnboundExpression | null;
	widthDependent: DependentExpression | null;
	heightDependent: DependentExpression | null;
}

/**
 * Builder for constructing an immutable Presentation instance.
 *
 * Orchestrates the three-phase expression lifecycle:
 *   1. UNBOUND  - collect layout expressions as strings or native values
 *   2. BINDING  - bind all expressions against a BindingContext
 *   3. BOUND    - resolve dependencies, then build the Presentation
 *
 * Instances move monotonically through phases and cannot be reused.
 */
export class PresentationBuilder {

	private phase: PhaseType;
	private readonly bindingContext: DefaultBindingContext;
	private readonly sections: SectionBuilder[] = [];
	private readonly viewFactory: ViewFactory;
	private readonly slideLayout: SlideLayout;
	private dependentExpressionsInternal: DependentExpression[] | null = null;

	constructor(options: { viewFactory: ViewFactory }) {
		const { viewFactory } = options;
		if (!viewFactory) {
			throw new Error("PresentationBuilder requires a viewFactory");
		}

		this.viewFactory = viewFactory;
		this.phase = Phase.UNBOUND;
		this.bindingContext = new DefaultBindingContext(null);
		this.slideLayout = {
			widthValue: 640,
			heightValue: 480,
			widthUnbound: null,
			heightUnbound: null,
			widthDependent: null,
			heightDependent: null,
		};
	}

	get currentPhase(): PhaseType {
		return this.phase;
	}

	get rootBindingContext(): DefaultBindingContext {
		return this.bindingContext;
	}

	private checkPhase(required: PhaseType, methodName: string): void {
		if (this.phase !== required) {
			throw new Error(
				`PresentationBuilder.${methodName}: Cannot be called in current phase`,
			);
		}
	}

	/**
	 * Create a new SectionBuilder attached to this presentation.
	 */
	createSection(): SectionBuilder {
		this.checkPhase(Phase.UNBOUND, "createSection");

		const sectionBuilder = new SectionBuilder({
			parent: this,
			bindingContext: new DefaultBindingContext(this.bindingContext),
			viewFactory: this.viewFactory,
		});

		this.sections.push(sectionBuilder);
		return sectionBuilder;
	}

	// --------------------------------------------------
	// Presentation properties
	// --------------------------------------------------

	setSlideWidth(value: number): void {
		this.checkPhase(Phase.UNBOUND, "setSlideWidth");

		if (typeof value !== "number" || value <= 0) {
			throw new Error("PresentationBuilder: Slide width must be a number > 0");
		}

		this.slideLayout.widthValue = value;
	}

	setSlideHeight(value: number): void {
		this.checkPhase(Phase.UNBOUND, "setSlideHeight");

		if (typeof value !== "number" || value <= 0) {
			throw new Error("PresentationBuilder: Slide height must be a number > 0");
		}

		this.slideLayout.heightValue = value;
	}

	// --------------------------------------------------
	// Binding orchestration
	// --------------------------------------------------

	bindExpressions(): DependentExpression[] {
		this.checkPhase(Phase.UNBOUND, "bindExpressions");

		// Allow sections to configure layout and publish names
		this.beforeBinding();
		this.sections.forEach((s) => s.beforeBinding());

		// Transition to BINDING
		this.phase = Phase.BINDING;

		// Bind all section expressions
		const sectionExpressions = this.sections.flatMap((s) =>
			s.bindExpressions(),
		);

		// Bind presentation-level slideWidth/slideHeight
		const slideWidthDep = this.slideLayout.widthUnbound!.bind(
			this.bindingContext,
		);
		const slideHeightDep = this.slideLayout.heightUnbound!.bind(
			this.bindingContext,
		);

		this.slideLayout.widthDependent = slideWidthDep;
		this.slideLayout.heightDependent = slideHeightDep;

		this.dependentExpressionsInternal = [
			slideWidthDep,
			slideHeightDep,
			...sectionExpressions,
		];

		this.phase = Phase.BOUND;
		return this.dependentExpressionsInternal.slice();
	}

	get dependentExpressions(): readonly DependentExpression[] {
		this.checkPhase(Phase.BOUND, "dependentExpressions");
		return this.dependentExpressionsInternal
			? this.dependentExpressionsInternal.slice()
			: [];
	}

	/**
	 * INTERNAL IMPLEMENTATION DETAIL
	 *
	 * Register slideWidth/slideHeight and wire up section adjacency
	 * before the binding phase begins.
	 */
	private beforeBinding(): void {
		this.checkPhase(Phase.UNBOUND, "beforeBinding");

		const { widthValue, heightValue } = this.slideLayout;

		const widthUnbound = createNativeExpression(() => widthValue);
		const heightUnbound = createNativeExpression(() => heightValue);

		this.slideLayout.widthUnbound = widthUnbound;
		this.slideLayout.heightUnbound = heightUnbound;

		this.bindingContext.addExpression("slideWidth", NameType.VALUE, widthUnbound);
		this.bindingContext.addExpression(
			"slideHeight",
			NameType.VALUE,
			heightUnbound,
		);

		// Connect sections to each other
		for (let i = 0; i < this.sections.length; i++) {
			const current = this.sections[i]!;

			if (i > 0) {
				current.setPrevious(this.sections[i - 1]!);
			}

			if (i < this.sections.length - 1) {
				current.setNext(this.sections[i + 1]!);
			}
		}
	}

	// --------------------------------------------------
	// Build final Presentation
	// --------------------------------------------------

	build(): Presentation {
		this.checkPhase(Phase.BOUND, "build");

		const presentation = new Presentation({
			sections: [],
			slideWidth: this.slideLayout.widthDependent!.expression,
			slideHeight: this.slideLayout.heightDependent!.expression,
			viewFactory: this.viewFactory,
		});

		const builtSections: Section[] = this.sections.map((sectionBuilder) =>
			sectionBuilder.build({ parent: presentation }),
		);

		presentation._setSections(builtSections);
		this.phase = Phase.BUILT;

		return presentation;
	}
}
