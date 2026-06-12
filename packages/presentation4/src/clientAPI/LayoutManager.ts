import type { Layout, LayoutOptions } from "./Layout";
import type { LayoutPicker } from "./LayoutPicker";

/**
 * LayoutManager handles the set of layouts defined for a presentation and
 * controls which one is currently active.
 *
 * Every presentation has a default layout created automatically at construction
 * time. Additional layouts can be added to support different viewport sizes or
 * orientations. A LayoutPicker can be set to automate layout selection on resize.
 *
 * LayoutManager is accessed via Presentation.layout.
 */
export interface LayoutManager {
  /** All layouts defined for this presentation, including the default. */
  get layouts(): readonly Layout[];

  /** Creates and registers a new layout with the given basis dimensions. */
  addLayout(options: LayoutOptions): Layout;

  /** The layout created automatically at presentation construction time. */
  get defaultLayout(): Layout;

  /** The layout currently used for all anchor evaluation and rendering. */
  get activeLayout(): Layout;

  /**
   * Switches the active layout. All anchored objects update their anchor values
   * to the set stored for the new layout.
   */
  setActiveLayout(layout: Layout): void;

  /** True if a LayoutPicker has been set. */
  get hasLayoutPicker(): boolean;

  /**
   * The LayoutPicker that automatically selects a layout on resize.
   * Throws if none has been set — check hasLayoutPicker first.
   */
  get layoutPicker(): LayoutPicker;

  /** Sets a LayoutPicker for automatic layout selection on resize. */
  setLayoutPicker(picker: LayoutPicker): void;
}
