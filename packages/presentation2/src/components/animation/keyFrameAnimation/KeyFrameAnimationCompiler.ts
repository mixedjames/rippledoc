import { KeyFrameAnimation } from "./KeyFrameAnimation";
import { KeyFrameAnimationBuilder } from "./KeyFrameAnimationBuilder";
import { ElementCompiler } from "../../element/ElementCompiler";
import { Element } from "../../element/Element";
import { SectionBuilder } from "../../section/SectionBuilder";
import { Section } from "../../section/Section";

export class KeyFrameAnimationCompiler {
  // Structural relationships
  //
  private builder_: KeyFrameAnimationBuilder;
  private elementOrSectionCompiler_: ElementCompiler | SectionBuilder;

  // Owned properties
  //

  constructor(options: {
    animationBuilder: KeyFrameAnimationBuilder;
    elementOrSectionCompiler: ElementCompiler | SectionBuilder;
  }) {
    this.builder_ = options.animationBuilder;
    this.elementOrSectionCompiler_ = options.elementOrSectionCompiler;
  }

  beforeCompile() {
    this.validateAndDerive();
  }

  private validateAndDerive() {
    // No validation or derivation for now.
  }

  compile(element: Element | Section): KeyFrameAnimation {
    return new KeyFrameAnimation({
      elementOrSection: element,
      trigger: element.scrollTriggerByName(this.builder_.scrollTrigger),
      keyFrames: this.builder_.keyFrames.map((keyFrame) => ({ ...keyFrame })),
      duration: this.builder_.duration,
      scrollDriven: this.builder_.scrollDriven,
    });
  }
}
