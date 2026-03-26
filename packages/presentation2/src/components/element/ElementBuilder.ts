import { SectionBuilder } from "../section/SectionBuilder";
import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { AxisBuilder } from "../common/AxisBuilder";
import { ScrollTriggerBuilder } from "../scrollTrigger/ScrollTriggerBuilder";
import { PinBuilder } from "../pin/PinBuilder";
import { SectionCompiler } from "../section/SectionCompiler";
import { ElementCompiler } from "./ElementCompiler";

/**
 *
 *
 * ## Structural related classes
 * ElementBuilder has direct access to:
 * - SectionBuilder, @see section
 * - PresentationBuilder, @see presentation
 *
 */
export class ElementBuilder {
  // Structural relationships ----------------------------------------------------------------------
  //
  private section_: SectionBuilder;

  // Owned properties ------------------------------------------------------------------------------
  //

  private name_: string = "";
  private scrollTriggers_: ScrollTriggerBuilder[] = [];
  private pins_: PinBuilder[] = [];

  // Order of axis components is key here: AxisBuilder.deriveExpressions depends on it
  // DO NOT CHANGE
  private xAxis_ = new AxisBuilder(["left", "width", "right"] as const);
  private yAxis_ = new AxisBuilder(["top", "height", "bottom"] as const);

  constructor(options: { section: SectionBuilder }) {
    this.section_ = options.section;
  }

  makeCompiler(sectionCompiler: SectionCompiler): ElementCompiler {
    return new ElementCompiler({
      elementBuilder: this,
      sectionCompiler: sectionCompiler,
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get section(): SectionBuilder {
    return this.section_;
  }

  get presentation(): PresentationBuilder {
    return this.section.presentation;
  }

  addScrollTrigger(): ScrollTriggerBuilder {
    const scrollTrigger = new ScrollTriggerBuilder({ element: this });
    this.scrollTriggers_.push(scrollTrigger);
    return scrollTrigger;
  }

  addPin(): PinBuilder {
    const pin = new PinBuilder({ element: this });
    this.pins_.push(pin);
    return pin;
  }

  get scrollTriggers(): readonly ScrollTriggerBuilder[] {
    return this.scrollTriggers_;
  }

  get pins(): readonly PinBuilder[] {
    return this.pins_;
  }

  // ----------------------------------------------------------------------------------------------
  // Owned properties
  // ----------------------------------------------------------------------------------------------

  // Axes
  //

  get xAxis(): AxisBuilder<"left" | "width" | "right"> {
    return this.xAxis_;
  }

  get yAxis(): AxisBuilder<"top" | "height" | "bottom"> {
    return this.yAxis_;
  }

  // Name
  //

  get name(): string {
    return this.name_;
  }

  set name(value: string) {
    this.name_ = value;
  }

  get hasName(): boolean {
    return this.name_.trim().length > 0;
  }
}
