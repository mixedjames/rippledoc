import type { PresentationView } from "../../viewAPI/PresentationView";
import type { SectionView } from "../../viewAPI/SectionView";
import { NullSectionView } from "./NullSectionView";

/**
 * A no-op PresentationView used before a real view is attached.
 *
 * Allows the model tree to be constructed and have its anchor constraints
 * configured without requiring a renderer to be present.
 */
export class NullPresentationView implements PresentationView {
  get width(): number {
    return 0;
  }

  get height(): number {
    return 0;
  }

  layout(): void {}

  createSectionView(): SectionView {
    return new NullSectionView();
  }

  destroy(): void {}
}
