import { ElementBuilder } from "../element/ElementBuilder";
import { SectionBuilder } from "../section/SectionBuilder";
import { PresentationBuilder } from "../presentation/PresentationBuilder";

/**
 * Bag-of-properties builder for ScrollTrigger.
 *
 * Implements the "Builder" role. See PresentationBuilder for more details on the Builder pattern in
 * this presentation2.
 */
export class ScrollTriggerBuilder {
  private start_: string = "";
  private end_: string = "";
  private name_: string = "";

  private parent_: ElementBuilder | SectionBuilder;

  constructor(options: { element?: ElementBuilder; section?: SectionBuilder }) {
    if (options.element && options.section === undefined) {
      this.parent_ = options.element;
    } else if (options.section && options.element === undefined) {
      this.parent_ = options.section;
    } else {
      throw new Error(
        "ScrollTriggerBuilder must have either an element or a section as parent, but not both",
      );
    }
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get parent(): ElementBuilder | SectionBuilder {
    return this.parent_;
  }

  get element(): ElementBuilder {
    if (this.parent_ instanceof ElementBuilder) {
      return this.parent_;
    } else {
      throw new Error(
        "ScrollTriggerBuilder parent must be an ElementBuilder to access element property",
      );
    }
  }

  get section(): SectionBuilder {
    if (this.parent_ instanceof SectionBuilder) {
      return this.parent_;
    } else {
      return this.parent_.section;
    }
  }

  get presentation(): PresentationBuilder {
    return this.section.presentation;
  }

  // ----------------------------------------------------------------------------------------------
  // Owned properties
  // ----------------------------------------------------------------------------------------------

  get name(): string {
    return this.name_;
  }

  set name(value: string) {
    this.name_ = value;
  }

  get start(): string {
    return this.start_;
  }

  set start(value: string) {
    this.start_ = value;
  }

  get end(): string {
    return this.end_;
  }

  set end(value: string) {
    this.end_ = value;
  }
}
