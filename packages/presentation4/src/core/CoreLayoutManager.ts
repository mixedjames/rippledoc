import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { Layout, LayoutOptions } from "../clientAPI/Layout";
import type { LayoutPicker } from "../clientAPI/LayoutPicker";
import { CoreLayout } from "./CoreLayout";

/**
 * Concrete implementation of LayoutManager.
 *
 * Owned by CorePresentation. Manages the ordered list of layouts and tracks
 * which one is active. The default layout is created at construction time.
 */
export class CoreLayoutManager implements LayoutManager {
  private readonly layouts_: CoreLayout[] = [];
  private activeLayout_: CoreLayout;
  private layoutPicker_: LayoutPicker | null = null;
  private layoutAddedCallback_: ((layout: Layout) => void) | null = null;
  private layoutActiveChangedCallback_: ((layout: Layout) => void) | null =
    null;

  constructor(defaultLayoutOptions: LayoutOptions) {
    const defaultLayout = new CoreLayout(defaultLayoutOptions);
    this.layouts_.push(defaultLayout);
    this.activeLayout_ = defaultLayout;
  }

  /**
   * Registers a callback invoked each time addLayout() succeeds.
   * Used by CorePresentation to cascade new layouts through the document tree.
   */
  setLayoutAddedCallback(callback: (layout: Layout) => void): void {
    this.layoutAddedCallback_ = callback;
  }

  /** Registers a callback invoked each time setActiveLayout() succeeds. */
  setLayoutActiveChangedCallback(callback: (layout: Layout) => void): void {
    this.layoutActiveChangedCallback_ = callback;
  }

  // ── LayoutManager (clientAPI) ────────────────────────────────────────────

  get layouts(): readonly Layout[] {
    return this.layouts_;
  }

  addLayout(options: LayoutOptions): Layout {
    const layout = new CoreLayout(options);
    this.layouts_.push(layout);
    this.layoutAddedCallback_?.(layout);
    return layout;
  }

  get defaultLayout(): Layout {
    return this.layouts_[0]!;
  }

  get activeLayout(): Layout {
    return this.activeLayout_;
  }

  setActiveLayout(layout: Layout): void {
    const found = this.layouts_.find((l) => l === layout);
    if (!found) throw new Error("Layout does not belong to this manager.");
    this.activeLayout_ = found;
    this.layoutActiveChangedCallback_?.(found);
  }

  get hasLayoutPicker(): boolean {
    return this.layoutPicker_ !== null;
  }

  get layoutPicker(): LayoutPicker {
    if (!this.layoutPicker_) throw new Error("No LayoutPicker has been set.");
    return this.layoutPicker_;
  }

  setLayoutPicker(picker: LayoutPicker): void {
    this.layoutPicker_ = picker;
  }
}
