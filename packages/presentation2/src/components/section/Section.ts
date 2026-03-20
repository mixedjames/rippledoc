import { Element } from "../element/Element";
import { Presentation } from "../..";

interface SectionPhase2Constructor {
  setElements(elements: Element[]): SectionPhase2Constructor;

  complete(): void;
}

type SectionOptions = {
  presentation: Presentation;
};

export class Section {
  private static constructionToken_: symbol = Symbol(
    "Section.ConstructorProtector",
  );

  private presentation_: Presentation;
  private elements_: Element[] | null = null;

  private phase2Constructor_: SectionPhase2Constructor | null = {
    setElements: (elements: Element[]) => {
      this.elements_ = elements;
      return this.phase2Constructor_!;
    },

    complete: () => {
      this.phase2Constructor_ = null;
    },
  };

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

  // ----------------------------------------------------------------------------------------------
  // ...
  // ----------------------------------------------------------------------------------------------
}
