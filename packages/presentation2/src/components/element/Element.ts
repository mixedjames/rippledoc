import { Expression } from "@rippledoc/expressions";

import { Section } from "../section/Section";
import { Presentation } from "../presentation/Presentation";

/**
 * Content dependent dimension types.
 */
export enum ContentDependentDimension {
  None = "none",
  Width = "width",
  Height = "height",
}

export class Element {
  // Structural relationships ----------------------------------------------------------------------
  //
  private section_: Section;

  // Owned properties ------------------------------------------------------------------------------
  //
  private name_: string;

  private contentDependentDimension_: ContentDependentDimension =
    ContentDependentDimension.None;

  private left_: Expression;
  private right_: Expression;
  private width_: Expression;

  private top_: Expression;
  private bottom_: Expression;
  private height_: Expression;

  constructor(options: {
    section: Section;
    name: string;
    contentDependentDimension: ContentDependentDimension;
    left: Expression;
    right: Expression;
    width: Expression;
    top: Expression;
    bottom: Expression;
    height: Expression;
  }) {
    this.section_ = options.section;

    this.name_ = options.name;
    this.contentDependentDimension_ = options.contentDependentDimension;

    this.left_ = options.left;
    this.right_ = options.right;
    this.width_ = options.width;

    this.top_ = options.top;
    this.bottom_ = options.bottom;
    this.height_ = options.height;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get section(): Section {
    return this.section_;
  }

  get presentation(): Presentation {
    return this.section_.presentation;
  }

  // ----------------------------------------------------------------------------------------------
  // Non-structural, non-geometric properties
  // ----------------------------------------------------------------------------------------------

  get name(): string {
    return this.name_;
  }

  // ----------------------------------------------------------------------------------------------
  // Geometry
  // ----------------------------------------------------------------------------------------------

  get left(): number {
    return this.left_.evaluate();
  }

  get right(): number {
    return this.right_.evaluate();
  }

  get width(): number {
    return this.width_.evaluate();
  }

  get top(): number {
    return this.top_.evaluate();
  }

  get bottom(): number {
    return this.bottom_.evaluate();
  }

  get height(): number {
    return this.height_.evaluate();
  }
}
