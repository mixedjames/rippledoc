import { Element } from "../element/Element";
import { Presentation, ScrollTrigger } from "../..";
import { Expression } from "packages/expressions/dist";
import { ScrollTriggeredAnimation } from "../animation/ScrollTriggeredAnimation";

interface SectionPhase2Constructor {
  setElements(elements: Element[]): SectionPhase2Constructor;
  setScrollTriggers(scrollTriggers: ScrollTrigger[]): SectionPhase2Constructor;

  complete(): void;
}

type SectionOptions = {
  presentation: Presentation;

  sectionTop: Expression;
  sectionHeight: Expression;
  sectionBottom: Expression;
  name: string;
};

export class Section {
  // Construction-related data ---------------------------------------------------------------------
  //

  private static constructionToken_: symbol = Symbol(
    "Section.ConstructorProtector",
  );

  private phase2Constructor_: SectionPhase2Constructor | null = {
    setElements: (elements: Element[]) => {
      this.elements_ = elements;
      return this.phase2Constructor_!;
    },

    setScrollTriggers: (scrollTriggers: ScrollTrigger[]) => {
      this.scrollTriggers_ = scrollTriggers;
      return this.phase2Constructor_!;
    },

    complete: () => {
      this.phase2Constructor_ = null;
    },
  };

  // Structural relationships ----------------------------------------------------------------------
  //

  private presentation_: Presentation;
  private elements_: Element[] | null = null;

  // Owned properties ------------------------------------------------------------------------------
  //
  private name_: string = "";

  private sectionTop_: Expression;
  private sectionHeight_: Expression;
  private sectionBottom_: Expression;

  private scrollTriggers_: ScrollTrigger[] = [];

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(token: symbol, options: SectionOptions) {
    if (token !== Section.constructionToken_) {
      throw new Error(
        "Section.constructor() - cannot call constructor directly; use create.",
      );
    }

    this.presentation_ = options.presentation;
    this.sectionTop_ = options.sectionTop;
    this.sectionHeight_ = options.sectionHeight;
    this.sectionBottom_ = options.sectionBottom;
    this.name_ = options.name;
  }

  private get phase2Constructor(): SectionPhase2Constructor {
    if (this.phase2Constructor_ === null) {
      throw new Error("Phase 2 construction already complete");
    }
    return this.phase2Constructor_;
  }

  static create(options: SectionOptions): {
    section: Section;
    phase2Constructor: SectionPhase2Constructor;
  } {
    const section = new Section(Section.constructionToken_, options);

    return {
      section,
      phase2Constructor: section.phase2Constructor,
    };
  }

  // ----------------------------------------------------------------------------------------------
  // Structural Relations
  // ----------------------------------------------------------------------------------------------

  get presentation(): Presentation {
    return this.presentation_;
  }

  get elements(): readonly Element[] {
    if (this.elements_ === null) {
      throw new Error(
        "Phase 2 construction not yet complete. .elements has not be created.",
      );
    }

    return this.elements_;
  }

  get scrollTriggers(): readonly ScrollTrigger[] {
    return this.scrollTriggers_;
  }

  scrollTriggerByName(name: string): ScrollTrigger {
    const scrollTrigger = this.scrollTriggers_.find((st) => st.name === name);
    if (!scrollTrigger) {
      throw new Error(`ScrollTrigger with name "${name}" not found.`);
    }
    return scrollTrigger;
  }

  get animations(): readonly ScrollTriggeredAnimation[] {
    return [];
  }

  // ----------------------------------------------------------------------------------------------
  // Geometry
  // ----------------------------------------------------------------------------------------------

  get name(): string {
    return this.name_;
  }

  get sectionTop(): number {
    return this.sectionTop_.evaluate();
  }

  get sectionHeight(): number {
    return this.sectionHeight_.evaluate();
  }

  get sectionBottom(): number {
    return this.sectionBottom_.evaluate();
  }
}
