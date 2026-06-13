import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorElementView } from "./EditorElementView";

export class EditorSVGImageElementView extends EditorElementView {
  constructor(owner: p4.SVGImageElementViewOwner, parent: EditorSectionView) {
    super(owner, parent);
    this.element.classList.add("svg-image-element");
  }
}
