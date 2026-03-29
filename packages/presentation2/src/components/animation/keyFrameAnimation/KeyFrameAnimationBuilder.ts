import { KeyFrame } from "./KeyFrame";
import { ElementBuilder } from "../../element/ElementBuilder";
import { SectionBuilder } from "../../section/SectionBuilder";

export class KeyFrameAnimationBuilder {
  // Structural relationships ----------------------------------------------------------------------
  //
  private element_: ElementBuilder | SectionBuilder;
  private scrollTrigger_: string = "";

  // Owned properties ------------------------------------------------------------------------------
  //
  private duration_: number = 0;
  private keyFrames_: KeyFrame[] = [];

  constructor(options: { element: ElementBuilder | SectionBuilder }) {
    this.element_ = options.element;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get elementOrSection(): ElementBuilder | SectionBuilder {
    return this.element_;
  }

  get scrollTrigger(): string {
    return this.scrollTrigger_;
  }

  set scrollTrigger(value: string) {
    this.scrollTrigger_ = value;
  }

  // ----------------------------------------------------------------------------------------------
  // Owned properties
  // ----------------------------------------------------------------------------------------------

  addKeyFrame(keyFrame: KeyFrame): this {
    this.keyFrames_.push({ ...keyFrame });
    return this;
  }

  get keyFrames(): readonly KeyFrame[] {
    return this.keyFrames_;
  }

  get duration(): number {
    return this.duration_;
  }

  set duration(value: number) {
    this.duration_ = value;
  }
}
