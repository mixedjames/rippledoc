import { Presentation } from "./Presentation";

export class ScaleHelper {
  private presentation_: Presentation;

  private width_: number;
  private height_: number;
  private scale_: number = 1;
  private tx_: number = 0;

  constructor(presentation: Presentation) {
    this.presentation_ = presentation;
    this.width_ = presentation.basisWidth;
    this.height_ = presentation.basisHeight;
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
    const scaleX = width / this.presentation_.basisWidth;
    const scaleY = height / this.presentation_.basisHeight;
    this.scale_ = Math.min(scaleX, scaleY);

    const scaledWidth = this.presentation_.basisWidth * this.scale_;
    this.tx_ = (width - scaledWidth) / 2; // Center horizontally
  }
}
