import { Expression } from "@rippledoc/expressions";
import { Presentation } from "./Presentation";

export class ScrollTrigger {
  private presentation_: Presentation;

  private start_: Expression;
  private startViewOffset_: number;

  private end_: Expression;
  private endViewOffset_: number;

  constructor(options: {
    presentation: Presentation;
    start: Expression;
    startViewOffset?: number;
    end: Expression;
    endViewOffset?: number;
  }) {
    const {
      presentation,
      start,
      startViewOffset = 0,
      end,
      endViewOffset = 0,
    } = options;

    this.presentation_ = presentation;
    this.start_ = start;
    this.startViewOffset_ = startViewOffset;
    this.end_ = end;
    this.endViewOffset_ = endViewOffset;
  }

  get start(): number {
    const geometry = this.presentation_.geometry;
    const viewportHeight = geometry.viewport.height / geometry.scale;

    return this.start_.evaluate() - this.startViewOffset_ * viewportHeight;
  }

  get end(): number {
    const geometry = this.presentation_.geometry;
    const viewportHeight = geometry.viewport.height / geometry.scale;

    return this.end_.evaluate() - this.endViewOffset_ * viewportHeight;
  }
}
