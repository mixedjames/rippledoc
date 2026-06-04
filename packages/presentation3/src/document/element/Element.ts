import { Section } from "../section/Section";
import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";

/**
 *
 */
export class Element extends ConcreteAnchoredObjectBase {
  constructor(readonly section: Section) {
    super("element");
  }
}
