import { Element } from "../../element/Element";
import { ElementCompiler } from "../../element/ElementCompiler";
import { Pin } from "./Pin";
import { PinBuilder } from "./PinBuilder";

export class PinCompiler {
  // Structural relationships
  //
  private builder_: PinBuilder;
  private elementCompiler_: ElementCompiler;

  // Owned properties
  //

  constructor(options: {
    pinBuilder: PinBuilder;
    elementCompiler: ElementCompiler;
  }) {
    this.builder_ = options.pinBuilder;
    this.elementCompiler_ = options.elementCompiler;
  }
  // ----------------------------------------------------------------------------------------------
  // Pre-compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  beforeCompile() {
    this.validateAndDerive();
  }

  private validateAndDerive() {
    // Nothing yet
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(element: Element): Pin {
    return new Pin({
      element,
      scrollTrigger: element.scrollTriggerByName(this.builder_.scrollTrigger),
    });
  }
}
