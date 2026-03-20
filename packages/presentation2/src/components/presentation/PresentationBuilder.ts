import { SectionBuilder } from "../section/SectionBuilder";

/**
 *
 */
export class PresentationBuilder {
  private sections_: SectionBuilder[] = [];

  private basisDimensions_: { width: number; height: number } = {
    width: 800,
    height: 600,
  };

  addSection(): SectionBuilder {
    const section = new SectionBuilder({ presentation: this });
    this.sections_.push(section);
    return section;
  }

  get sections(): readonly SectionBuilder[] {
    return this.sections_;
  }

  setBasisDimensions(width: number, height: number): void {
    this.basisDimensions_ = { width, height };
  }

  get basisDimensions(): { width: number; height: number } {
    return { ...this.basisDimensions_ };
  }
}
