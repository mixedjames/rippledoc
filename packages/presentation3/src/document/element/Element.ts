import { ConcreteSection, Section } from "../section/Section";
import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import { Presentation } from "../presentation/Presentation";
import { ViewFactory } from "../presentation/ViewFactory";
import { SectionViewOwner } from "../section/SectionView";
import { ElementView, NullElementView } from "./ElementView";

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

  private view_: ElementView = new NullElementView();

  constructor(section: ConcreteSection) {
    super("element");
    this.section_ = section;
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

  replaceView(viewFactory: ViewFactory): void {
    this.view_.destroy();
    this.view_ = viewFactory.createElementView(this);
  }

  // **********************************************************************************************
  // ElementViewOwner implementation
  // **********************************************************************************************

  get sectionView(): SectionViewOwner {
    return this.section_;
  }
}
