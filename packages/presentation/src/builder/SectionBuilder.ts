import {
	DefaultBindingContext,
	NameType,
	parseExpression,
} from "@expressions";
import type { DependentExpression, UnboundExpression } from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import { Section } from "../Section";
import type { Presentation } from "../Presentation";
import { ElementBuilder } from "./ElementBuilder";
import { Phase, type PhaseType, PresentationBuilder } from "./PresentationBuilder";

interface SectionLayoutSlot {
	unbound: UnboundExpression | null;
	dependent: DependentExpression | null;
}

interface SectionLayout {
	sectionTop: SectionLayoutSlot;
	sectionHeight: SectionLayoutSlot;
	sectionBottom: SectionLayoutSlot;
}

interface SectionBuilderOptions {
	parent: PresentationBuilder;
	bindingContext: DefaultBindingContext;
	viewFactory: ViewFactory;
}

/**
 * Builder for a Section within a Presentation.
 */
export class SectionBuilder {

	private readonly parent: PresentationBuilder;
	private readonly bindingContextInternal: DefaultBindingContext;
	private readonly elements: ElementBuilder[] = [];
	private readonly viewFactory: ViewFactory;

	private prevSectionBuilder: SectionBuilder | null = null;
	private nextSectionBuilder: SectionBuilder | null = null;

	private readonly layout: SectionLayout;

	constructor(options: SectionBuilderOptions) {
		const { parent, bindingContext, viewFactory } = options;
		this.parent = parent;
		this.bindingContextInternal = bindingContext;
		this.viewFactory = viewFactory;
		this.layout = {
			sectionTop: { unbound: null, dependent: null },
			sectionHeight: { unbound: null, dependent: null },
			sectionBottom: { unbound: null, dependent: null },
		};
	}

	get bindingContext(): DefaultBindingContext {
		return this.bindingContextInternal;
	}

	get phase(): PhaseType {
		return this.parent.currentPhase;
	}

	private checkPhase(required: PhaseType, methodName: string): void {
		if (this.parent.currentPhase !== required) {
			throw new Error(
				`SectionBuilder.${methodName}: Cannot be called in current phase`,
			);
		}
	}

	// --------------------------------------------------
	// Section adjacency
	// --------------------------------------------------

	setPrevious(prev: SectionBuilder): void {
		this.checkPhase(Phase.UNBOUND, "setPrevious");
		this.prevSectionBuilder = prev;
		this.bindingContextInternal.addSubcontext(
			"prevSection",
			prev.bindingContext,
		);
	}

	setNext(next: SectionBuilder): void {
		this.checkPhase(Phase.UNBOUND, "setNext");
		this.nextSectionBuilder = next;
		this.bindingContextInternal.addSubcontext(
			"nextSection",
			next.bindingContext,
		);
	}

	// --------------------------------------------------
	// User API
	// --------------------------------------------------

	setHeight(exprString: string): void {
		this.checkPhase(Phase.UNBOUND, "setHeight");

		if (this.layout.sectionBottom.unbound !== null) {
			throw new Error("SectionBuilder: Cannot set both height and bottom");
		}

		this.layout.sectionHeight.unbound = parseExpression(exprString);
	}

	setBottom(exprString: string): void {
		this.checkPhase(Phase.UNBOUND, "setBottom");

		if (this.layout.sectionHeight.unbound !== null) {
			throw new Error("SectionBuilder: Cannot set both height and bottom");
		}

		this.layout.sectionBottom.unbound = parseExpression(exprString);
	}

	// --------------------------------------------------
	// Element creation
	// --------------------------------------------------

	createElement(): ElementBuilder {
		this.checkPhase(Phase.UNBOUND, "createElement");

		const element = new ElementBuilder({
			parent: this,
			bindingContext: new DefaultBindingContext(this.bindingContextInternal),
			viewFactory: this.viewFactory,
		});

		this.elements.push(element);
		return element;
	}

	// --------------------------------------------------
	// Pre-bind hook
	// --------------------------------------------------

	beforeBinding(): void {
		this.checkPhase(Phase.UNBOUND, "beforeBinding");

		// Validate user intent
		if (
			!this.layout.sectionHeight.unbound &&
			!this.layout.sectionBottom.unbound
		) {
			throw new Error(
				"SectionBuilder: Must specify either height or bottom",
			);
		}

		// ----- TOP -----
		if (this.prevSectionBuilder) {
			this.layout.sectionTop.unbound = parseExpression(
				"prevSection.sectionBottom",
			);
		} else {
			this.layout.sectionTop.unbound = parseExpression("0");
		}

		// ----- DERIVED -----
		if (this.layout.sectionHeight.unbound !== null) {
			this.layout.sectionBottom.unbound = parseExpression(
				"sectionTop + sectionHeight",
			);
		} else {
			this.layout.sectionHeight.unbound = parseExpression(
				"sectionBottom - sectionTop",
			);
		}

		// ----- Publish names -----

		this.bindingContextInternal.addExpression(
			"sectionTop",
			NameType.VALUE,
			this.layout.sectionTop.unbound!,
		);

		this.bindingContextInternal.addExpression(
			"sectionHeight",
			NameType.VALUE,
			this.layout.sectionHeight.unbound!,
		);

		this.bindingContextInternal.addExpression(
			"sectionBottom",
			NameType.VALUE,
			this.layout.sectionBottom.unbound!,
		);

		// ----- Recurse -----
		this.elements.forEach((el) => el.beforeBinding());
	}

	// --------------------------------------------------
	// Binding
	// --------------------------------------------------

	bindExpressions(): DependentExpression[] {
		this.checkPhase(Phase.BINDING, "bindExpressions");

		const depExprs: DependentExpression[] = [];

		for (const key of [
			"sectionTop",
			"sectionHeight",
			"sectionBottom",
		] as const) {
			const slot = this.layout[key];
			slot.dependent = slot.unbound!.bind(this.bindingContextInternal);
			depExprs.push(slot.dependent);
		}

		for (const el of this.elements) {
			depExprs.push(...el.bindExpressions());
		}

		return depExprs;
	}

	// --------------------------------------------------
	// Build
	// --------------------------------------------------

	build(options: { parent: Presentation }): Section {
		this.checkPhase(Phase.BOUND, "build");

		const { parent } = options;

		const section = new Section({
			parent,
			sectionTop: this.layout.sectionTop.dependent!.expression,
			sectionHeight: this.layout.sectionHeight.dependent!.expression,
			sectionBottom: this.layout.sectionBottom.dependent!.expression,
			elements: [],
			viewFactory: this.viewFactory,
		});

		const builtElements = this.elements.map((el) =>
			el.build({ parent: section }),
		);

		section._setElements(builtElements);
		return section;
	}
}
