import type { ConcreteSection, Section } from "../section/Section";
import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import type { Presentation } from "../presentation/Presentation";
import type { SectionView, SectionViewOwner } from "../section/SectionView";
import type { ElementView } from "./ElementView";

export interface Element extends ConcreteAnchoredObjectBase {
  get section(): Section;

  get presentation(): Presentation;

  replaceView(view: SectionView): void;
  layout({ scale, tx }: { scale: number; tx: number }): void;
}

export abstract class ConcreteElementBase
  extends ConcreteAnchoredObjectBase
  implements Element
{
  private readonly section_: ConcreteSection;

  private view_: ElementView;

  constructor(section: ConcreteSection, objectType = "element") {
    super(objectType);

    this.section_ = section;
    this.view_ = this.createView(this.section_.view);
  }

  protected abstract createView(view: SectionView): ElementView;

  get section(): Section {
    return this.section_;
  }

  get presentation(): Presentation {
    return this.section.presentation;
  }

  replaceView(view: SectionView): void {
    this.view_.destroy();
    this.view_ = this.createView(view);
  }

  get sectionView(): SectionViewOwner {
    return this.section_;
  }

  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.view_.layout({ scale, tx });
  }
}
