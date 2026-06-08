import { ConcreteSection, Section } from "../section/Section";
import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import { Presentation } from "../presentation/Presentation";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { ElementView } from "./ElementView";

export interface Element extends ConcreteAnchoredObjectBase {
  get section(): Section;

  get presentation(): Presentation;
}

/**
 *
 */
export class ConcreteElement
  extends ConcreteAnchoredObjectBase
  implements Element
{
  private readonly section_: ConcreteSection;

  private view_: ElementView;

  constructor(section: ConcreteSection) {
    super("element");

    this.section_ = section;
    this.view_ = this.section_.view.createElementView(this);
  }

  // **********************************************************************************************
  // Element implementation
  // **********************************************************************************************

  get section(): Section {
    return this.section_;
  }

  get presentation(): Presentation {
    return this.section.presentation;
  }

  replaceView(view: SectionView): void {
    this.view_.destroy();
    this.view_ = view.createElementView(this);
  }

  // **********************************************************************************************
  // ElementViewOwner implementation
  // **********************************************************************************************

  get sectionView(): SectionViewOwner {
    return this.section_;
  }
}
