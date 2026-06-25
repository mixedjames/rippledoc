import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "../EditorSectionView";
import { EditorElementView } from "./EditorElementView";

// Not yet implemented — rendering content is a future task.
export class EditorBitmapImageElementView extends EditorElementView {
  constructor(
    owner: p4.BitmapImageElementViewOwner,
    parent: EditorSectionView,
  ) {
    super(owner, parent);
    this.element.classList.add("bitmap-image-element");
  }
}
