import type { Layout, LayoutOptions } from "../clientAPI/Layout";

/**
 * Concrete implementation of Layout.
 */
export class CoreLayout implements Layout {
  private readonly basisWidth_: number;
  private readonly basisHeight_: number;

  constructor(options: LayoutOptions) {
    this.basisWidth_ = options.basisWidth;
    this.basisHeight_ = options.basisHeight;
  }

  get basisWidth(): number {
    return this.basisWidth_;
  }

  get basisHeight(): number {
    return this.basisHeight_;
  }
}
