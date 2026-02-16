/**
 * Important Note: this is an internal class not exposed publicly.
 *
 * Represents a point in the scroll timeline where a trigger occurs.
 * Calculates the scroll position where an element position aligns with a viewport position.
 * Maintains sufficient state to recalculate on layout changes.
 */

interface TriggerPointParams {
  element: HTMLElement;
  elementY: number;
  viewport: HTMLElement;
  viewportY: number;
}

export class TriggerPoint {
  // The element we are triggering from
  // elementY is a number between 0 and 1 representing a position on the element
  // 0 = top, 1 = bottom
  private element_: HTMLElement;
  private elementY_: number;

  // The viewportY is a number between 0 and 1 representing a position in the viewport
  // 0 = top, 1 = bottom
  // We don't store a reference to the viewport, just the Y position, because changes
  // are assumed to be rare and we can pass in the viewport when we need to refresh
  private viewportY_: number;

  // The scrollTop value where this trigger point occurs in viewport coordinates
  // NaN indicates that refresh() has not yet been called for this instance.
  private triggerY_: number = Number.NaN;

  /**
   * Creates a new TriggerPoint instance.
   */
  constructor({ element, elementY, viewport, viewportY }: TriggerPointParams) {
    this.validateConstructorParams_({ element, elementY, viewport, viewportY });

    // We can copy directly since validation has passed and types are all value types
    // or uncopyable references. No defensive copying needed.
    this.element_ = element;
    this.elementY_ = elementY;
    this.viewportY_ = viewportY;

    // We trust Trigger to call refresh when needed
    // this.refresh(viewport);
  }

  /**
   * Validates constructor parameters.
   * @throws {TypeError} If any parameter is invalid
   */
  private validateConstructorParams_({
    element,
    elementY,
    viewport,
    viewportY,
  }: TriggerPointParams): void {
    // Validate elementY is a number in range [0, 1]
    if (typeof elementY !== "number" || elementY < 0 || elementY > 1) {
      throw new TypeError(
        `elementY must be a number between 0 and 1, got: ${elementY}`,
      );
    }

    // Validate viewportY is a number in range [0, 1]
    if (typeof viewportY !== "number" || viewportY < 0 || viewportY > 1) {
      throw new TypeError(
        `viewportY must be a number between 0 and 1, got: ${viewportY}`,
      );
    }

    // Validate element is a child of viewport
    if (!viewport.contains(element)) {
      throw new TypeError("element must be a child of viewport");
    }
  }

  // Readonly accessors
  get element(): HTMLElement {
    return this.element_;
  }

  get elementY(): number {
    return this.elementY_;
  }

  get viewportY(): number {
    return this.viewportY_;
  }

  get triggerY(): number {
    if (Number.isNaN(this.triggerY_)) {
      throw new Error("triggerY is not valid until refresh() has been called.");
    }

    return this.triggerY_;
  }

  /**
   * Recalculates the trigger Y position based on current layout.
   */
  refresh(viewport: HTMLElement): void {
    /**
     * Algorithm:
     * 1. Get current bounding rects for element and viewport
     * 2. Calculate element offset relative to viewport top
     * 3. Add element Y offset (elementY * element height)
     * 4. Subtract viewport Y offset (viewportY * viewport height)
     * 5. Result is scroll position where element point aligns with viewport point
     */

    const elementRect = this.element_.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();

    // The calculation is a bit of a mind-bender. We are finding the scrollTop value
    // where a point on the element (elementY) aligns with a point in the viewport (viewportY).
    //
    // We start by finding the element's offset relative to the viewport top,
    // then add the elementY offset, and subtract the viewportY offset.
    //
    // Finally, we add the current scrollTop to convert from viewport-relative to world coordinates.

    const elementOffsetRelativeToVP =
      elementRect.top - vpRect.top + viewport.scrollTop;
    const elementOffsetOnElement = elementRect.height * this.elementY_;
    const viewportOffset = vpRect.height * this.viewportY_;

    this.triggerY_ =
      elementOffsetRelativeToVP + elementOffsetOnElement - viewportOffset;
  }
}
