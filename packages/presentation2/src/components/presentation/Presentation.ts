import { Section } from "../section/Section";

/**
 *
 */
interface Phase2Constructor {
  setSections(sections: Section[]): Phase2Constructor;

  complete(): void;
}

type PresentationOptions = {
  basisDimensions: { width: number; height: number };
};

/**
 *
 * # Implementation notes
 *
 * ## (1) Two-phase construction
 */
export class Presentation {
  // Construction-related data ---------------------------------------------------------------------
  //

  private static constructionToken_: symbol = Symbol(
    "Presentation.ConstructorProtector",
  );

  private phase2Constructor_: Phase2Constructor | null = {
    setSections: (sections: Section[]) => {
      this.sections_.push(...sections);
      return this.phase2Constructor;
    },
    complete: () => {
      this.phase2Constructor_ = null;
    },
  };

  // Owned properties ------------------------------------------------------------------------------
  //

  private basisDimensions_: { width: number; height: number };
  private sections_: Section[] = [];

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  /**
   * Don't call the constructor directly. Use Presentation.create() instead.
   */
  constructor(token: symbol, options: PresentationOptions) {
    if (token !== Presentation.constructionToken_) {
      throw new Error(
        "Presentation is not constructable. Use Presentation.create() instead.",
      );
    }

    this.basisDimensions_ = { ...options.basisDimensions };
  }

  private get phase2Constructor(): Phase2Constructor {
    if (this.phase2Constructor_ === null) {
      throw new Error("Phase 2 construction is already complete.");
    }

    return this.phase2Constructor_;
  }

  public static create(options: PresentationOptions): {
    presentation: Presentation;
    phase2Constructor: Phase2Constructor;
  } {
    const presentation = new Presentation(
      Presentation.constructionToken_,
      options,
    );
    return { presentation, phase2Constructor: presentation.phase2Constructor };
  }

  // ----------------------------------------------------------------------------------------------
  // ...
  // ----------------------------------------------------------------------------------------------

  get sections(): readonly Section[] {
    return this.sections_;
  }
}
