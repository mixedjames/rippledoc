/**
 * A Layout defines an alternate set of basis dimensions for a presentation.
 *
 * Every anchored object in the presentation maintains a separate set of anchor
 * values for each layout. Switching the active layout swaps all of those values
 * simultaneously, so the same document can have entirely different geometry
 * depending on which layout is active (e.g. a landscape layout and a portrait
 * layout for different screen orientations).
 *
 * Layouts are created and managed through LayoutManager.
 */
export interface Layout {
  /** Width of the virtual canvas when this layout is active. */
  get basisWidth(): number;

  /** Height of the virtual canvas when this layout is active. */
  get basisHeight(): number;
}

/**
 * Options supplied when creating a new layout.
 */
export interface LayoutOptions {
  basisWidth: number;
  basisHeight: number;
}
