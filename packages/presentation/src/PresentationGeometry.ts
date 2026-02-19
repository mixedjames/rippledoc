export class PresentationGeometry {
  private basis_: {
    width: number;
    height: number;
  } = { width: 640, height: 480 };

  private viewport_: {
    width: number;
    height: number;
  } = { width: 640, height: 480 };

  private scale_: number = 1;

  private tx_: number = 0;

  constructor(options?: {
    basisWidth?: number;
    basisHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
  }) {
    if (!options) {
      return;
    }

    const hasBasisWidth = options.basisWidth !== undefined;
    const hasBasisHeight = options.basisHeight !== undefined;
    if (hasBasisWidth || hasBasisHeight) {
      if (!hasBasisWidth || !hasBasisHeight) {
        throw new Error(
          "PresentationGeometry: basisWidth and basisHeight must be provided together when specifying basis dimensions.",
        );
      }
      this.setBasisDimensions(options.basisWidth!, options.basisHeight!);
    }

    const hasViewportWidth = options.viewportWidth !== undefined;
    const hasViewportHeight = options.viewportHeight !== undefined;
    if (hasViewportWidth || hasViewportHeight) {
      if (!hasViewportWidth || !hasViewportHeight) {
        throw new Error(
          "PresentationGeometry: viewportWidth and viewportHeight must be provided together when specifying viewport dimensions.",
        );
      }
      this.setViewportDimensions(
        options.viewportWidth!,
        options.viewportHeight!,
      );
    }
  }

  clone(): PresentationGeometry {
    const clone = new PresentationGeometry({
      basisWidth: this.basis_.width,
      basisHeight: this.basis_.height,
    });

    if (this.viewport_.width > 0 && this.viewport_.height > 0) {
      clone.setViewportDimensions(this.viewport_.width, this.viewport_.height);
    }

    return clone;
  }

  /**
   * Basis dimensions for the presentation slides. These are the "natural" width and height of the
   * slides before any scaling is applied. They can be set to any values, and the presentation will
   * scale to fit the viewport while maintaining the aspect ratio defined by these basis dimensions.
   *
   * For example, if you set basis.width = 800 and basis.height = 600, the presentation will have a
   * natural aspect ratio of 4:3. If the viewport is resized to a different aspect ratio, the
   * presentation will scale up or down to fit while preserving that 4:3 ratio.
   *
   * The default values are width: 640 and height: 480, chosen for no better reason than nostalgia.
   */
  get basis(): { width: number; height: number } {
    return { ...this.basis_ };
  }

  /**
   * The viewport dimensions represent the actual size of the area in which the presentation is
   * rendered. This is typically determined by the size of the container element in the DOM and can
   * change dynamically (e.g., when the browser window is resized).
   */
  get viewport(): { width: number; height: number } {
    return { ...this.viewport_ };
  }

  /**
   * The scale factor applied to the presentation slides.
   *
   * Scaling presentation basis coordinates by this value yeilds the largest rectangle that fits
   * within the viewport while maintaining the aspect ratio defined by the basis dimensions.
   */
  get scale(): number {
    return this.scale_;
  }

  /**
   * The translation offset applied to the presentation slides to ensure that the presentation is
   * centered within the viewport after scaling.
   */
  get tx(): number {
    return this.tx_;
  }

  setBasisDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error(
        `Invalid basis dimensions: width and height must be positive. Received width=${width}, height=${height}`,
      );
    }
    this.basis_.width = width;
    this.basis_.height = height;
  }

  setViewportDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error(
        `Invalid viewport dimensions: width and height must be positive. Received width=${width}, height=${height}`,
      );
    }

    this.viewport_.width = width;
    this.viewport_.height = height;

    // Recalculate scale and translation to maintain aspect ratio and center the presentation
    const scaleX = width / this.basis_.width;
    const scaleY = height / this.basis_.height;
    this.scale_ = Math.min(scaleX, scaleY);

    const scaledWidth = this.basis_.width * this.scale_;
    this.tx_ = (width - scaledWidth) / 2; // Center horizontally
  }

  mapBasisToViewport(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale_ + this.tx_,
      y: y * this.scale_, // No vertical translation needed since we top-align the presentation
    };
  }
}
