import { Expression } from "@rippledoc/expressions";

import { Section } from "../section/Section";
import { Presentation } from "../presentation/Presentation";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { Pin } from "../animation/pin/Pin";
import { ScrollTriggeredAnimation } from "../animation/ScrollTriggeredAnimation";

export interface ElementPhase2Constructor {
  setScrollTriggers(scrollTriggers: ScrollTrigger[]): ElementPhase2Constructor;

  setPins(pins: Pin[]): ElementPhase2Constructor;

  setAnimations(
    animations: ScrollTriggeredAnimation[],
  ): ElementPhase2Constructor;

  complete(): void;
}

export type ElementOptions = {
  section: Section;
  name: string;
  contentDependentDimension: ContentDependentDimension;
  left: Expression;
  right: Expression;
  width: Expression;
  top: Expression;
  bottom: Expression;
  height: Expression;
};

/**
 * Content dependent dimension types.
 */
export enum ContentDependentDimension {
  None = "none",
  Width = "width",
  Height = "height",
}

export class Element {
  // Construction-related data ---------------------------------------------------------------------
  //

  protected static constructionToken_: symbol = Symbol(
    "Element.ConstructorProtector",
  );

  private phase2Constructor_: ElementPhase2Constructor | null = {
    setScrollTriggers: (scrollTriggers: ScrollTrigger[]) => {
      this.scrollTriggers_ = scrollTriggers;
      return this.phase2Constructor_!;
    },

    setPins: (pins: Pin[]) => {
      this.pins_ = pins;
      return this.phase2Constructor_!;
    },

    setAnimations: (animations: ScrollTriggeredAnimation[]) => {
      this.animations_ = animations;
      return this.phase2Constructor_!;
    },

    complete: () => {
      this.phase2Constructor_ = null;
    },
  };

  // Structural relationships ----------------------------------------------------------------------
  //
  private section_: Section;
  private scrollTriggers_: ScrollTrigger[] = [];
  private pins_: Pin[] = [];
  private animations_: ScrollTriggeredAnimation[] = [];

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

  constructor(token: symbol, options: ElementOptions) {
    if (token !== Element.constructionToken_) {
      throw new Error(
        "Element constructor is private. Use Element.create() instead.",
      );
    }

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

  protected get phase2Constructor(): ElementPhase2Constructor {
    if (this.phase2Constructor_ === null) {
      throw new Error("Phase 2 construction already complete");
    }
    return this.phase2Constructor_;
  }

  static createElement(options: ElementOptions): {
    element: Element;
    phase2Constructor: ElementPhase2Constructor;
  } {
    const element = new Element(Element.constructionToken_, options);
    return {
      element,
      phase2Constructor: element.phase2Constructor,
    };
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

  scrollTriggerByName(name: string): ScrollTrigger {
    const scrollTrigger = this.scrollTriggers_.find((st) => st.name === name);
    if (!scrollTrigger) {
      throw new Error(`ScrollTrigger with name "${name}" not found.`);
    }
    return scrollTrigger;
  }

  get scrollTriggers(): readonly ScrollTrigger[] {
    return this.scrollTriggers_;
  }

  get pins(): readonly Pin[] {
    return this.pins_;
  }

  get animations(): readonly ScrollTriggeredAnimation[] {
    return this.animations_;
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

  get contentDependentDimension(): ContentDependentDimension {
    return this.contentDependentDimension_;
  }
}
