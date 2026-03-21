import { Presentation } from "../Presentation";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

export class ScaleHelper {
  private presentation_: Presentation;

  private width_: number = DEFAULT_WIDTH;
  private height_: number = DEFAULT_HEIGHT;
  private scale_: number = 1;
  private tx_: number = 0;

  constructor(presentation: Presentation) {
    this.presentation_ = presentation;
  }

  get width(): number {
    return this.width_;
  }

  get height(): number {
    return this.height_;
  }

  get scale(): number {
    return this.scale_;
  }

  get tx(): number {
    return this.tx_;
  }

  setPhysicalDimensions(dimensions: { width: number; height: number }) {
    const width = (this.width_ = dimensions.width);
    const height = (this.height_ = dimensions.height);

    // Recalculate scale and translation to maintain aspect ratio and center the presentation
    const scaleX = width / this.presentation_.basisDimensions.width;
    const scaleY = height / this.presentation_.basisDimensions.height;
    this.scale_ = Math.min(scaleX, scaleY);

    const scaledWidth = this.presentation_.basisDimensions.width * this.scale_;
    this.tx_ = (width - scaledWidth) / 2; // Center horizontally
  }
}
