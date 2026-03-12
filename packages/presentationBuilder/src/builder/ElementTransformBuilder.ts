import type { Element } from "@rippledoc/presentation";

interface PinInstruction {
  triggerName: string;
}

/**
 * Builder for per-element transform/animation instructions.
 *
 * This builder collects animation intent (currently only pins)
 * during the construction phase and applies it to a fully
 * constructed Element instance during the build phase.
 */
export class ElementTransformBuilder {
  private readonly pinInstructions_: PinInstruction[] = [];

  /**
   * Record a request to pin this element to a named scroll trigger.
   *
   * @param triggerName Name of the scroll trigger on this element that should drive the pin.
   */
  addPinByTriggerName(triggerName: string): void {
    if (!triggerName || typeof triggerName !== "string") {
      throw new Error(
        "ElementTransformBuilder.addPinByTriggerName: triggerName must be a non-empty string",
      );
    }

    console.log(
      `Made a pin from transform builder for trigger '${triggerName}'`,
    );
    this.pinInstructions_.push({ triggerName });
  }

  /**
   * Apply all recorded transform instructions to the given element.
   *
   * Pins are resolved strictly against the scroll triggers associated
   * with this element. Any missing or ambiguous trigger references are
   * treated as configuration errors.
   */
  applyTo(element: Element): void {
    if (!this.pinInstructions_.length) {
      return;
    }

    const elementName = element.name || "<unnamed>";

    // Resolve and apply pins one by one so we fail fast on
    // unknown trigger names while keeping duplicate-name
    // detection as a responsibility for higher-level code.
    for (const instruction of this.pinInstructions_) {
      const trigger = element.getScrollTriggerByName(instruction.triggerName);
      if (!trigger) {
        throw new Error(
          `ElementTransformBuilder.applyTo: pin references unknown scroll trigger '${instruction.triggerName}' on element '${elementName}'`,
        );
      }

      if (!element.animated) {
        element.animated = true;
      }

      element.transform.pin({ trigger });
    }

    this.pinInstructions_.length = 0;
  }
}
