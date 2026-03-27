import { AnimationBuilder } from "./AnimationBuilder";
import { Animation } from "./Animation";
import { ElementCompiler } from "../element/ElementCompiler";
import { Element } from "../element/Element";

export class AnimationCompiler {
  // Structural relationships
  //
  private builder_: AnimationBuilder;
  private elementCompiler_: ElementCompiler;

  // Owned properties
  //

  constructor(options: {
    animationBuilder: AnimationBuilder;
    elementCompiler: ElementCompiler;
  }) {
    this.builder_ = options.animationBuilder;
    this.elementCompiler_ = options.elementCompiler;
  }

  beforeCompile() {
    this.validateAndDerive();
  }

  private validateAndDerive() {
    // No validation or derivation for now.
  }

  compile(element: Element): Animation {
    return new Animation({
      element: element,
      trigger: element.scrollTriggerByName(this.builder_.scrollTrigger),
      keyFrames: this.builder_.keyFrames.map((keyFrame) => ({ ...keyFrame })),
      duration: this.builder_.duration,
    });
  }
}
