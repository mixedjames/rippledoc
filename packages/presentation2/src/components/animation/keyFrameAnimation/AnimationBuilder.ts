import { KeyFrame } from "./KeyFrame";
import { ElementBuilder } from "../../element/ElementBuilder";

export class AnimationBuilder {
  // Structural relationships ----------------------------------------------------------------------
  //
  private element_: ElementBuilder;
  private scrollTrigger_: string = "";

  // Owned properties ------------------------------------------------------------------------------
  //
  private duration_: number = 0;
  private keyFrames_: KeyFrame[] = [];

  constructor(options: { element: ElementBuilder }) {
    this.element_ = options.element;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get element(): ElementBuilder {
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
