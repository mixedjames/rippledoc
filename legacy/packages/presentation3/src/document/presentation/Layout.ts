import { Presentation } from "./Presentation";

export interface Layout {
  get presentation(): Presentation;
  get basisWidth(): number;
  get basisHeight(): number;
}

export class ConcreteLayout implements Layout {
  private presentation_: Presentation;

  private basisWidth_: number;
  private basisHeight_: number;

  constructor(
    presentation: Presentation,
    opts: {
      basisWidth: number;
      basisHeight: number;
    },
  ) {
    this.presentation_ = presentation;
    this.basisWidth_ = opts.basisWidth;
    this.basisHeight_ = opts.basisHeight;
  }

  // **********************************************************************************************
  // Layout implementation
  // **********************************************************************************************

  get presentation(): Presentation {
    return this.presentation_;
  }

  get basisWidth(): number {
    return this.basisWidth_;
  }

  get basisHeight(): number {
    return this.basisHeight_;
  }

  // **********************************************************************************************
  // ConcreteLayout implementation
  // **********************************************************************************************
}
