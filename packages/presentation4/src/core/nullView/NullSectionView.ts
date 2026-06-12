import type { SectionView } from "../../viewAPI/SectionView";
import type { ElementView } from "../../viewAPI/ElementView";
import { NullElementView } from "./NullElementView";

/**
 * A no-op SectionView used before a real view is attached.
 */
export class NullSectionView implements SectionView {
  layout(): void {}

  createMarkdownElementView(): ElementView {
    return new NullElementView();
  }

  createBitmapImageElementView(): ElementView {
    return new NullElementView();
  }

  createSVGImageElementView(): ElementView {
    return new NullElementView();
  }

  destroy(): void {}
}
