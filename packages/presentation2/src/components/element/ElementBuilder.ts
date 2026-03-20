import { SectionBuilder } from "../section/SectionBuilder";
import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { AxisBuilder } from "../common/AxisBuilder";
import { ContentDependentDimension } from "./Element";

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

  // Order of axis components is key here: AxisBuilder.deriveExpressions depends on it
  // DO NOT CHANGE
  private xAxis_ = new AxisBuilder(["left", "right", "width"] as const);
  private yAxis_ = new AxisBuilder(["top", "bottom", "height"] as const);

  private contentDependentDimension_: ContentDependentDimension =
    ContentDependentDimension.None;

  constructor(options: { section: SectionBuilder }) {
    this.section_ = options.section;
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

  get contentDependentDimension(): ContentDependentDimension {
    return this.contentDependentDimension_;
  }

  set contentDependentDimension(value: ContentDependentDimension) {
    this.contentDependentDimension_ = value;
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
