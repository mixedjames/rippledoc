import { Expression } from "@rippledoc/expressions";
import { Presentation } from "./Presentation";

/**
 * Immutable descriptor for a scroll trigger window within a Presentation.
 *
 * This type is responsible for turning expression-based definitions of
 * scroll positions into concrete values in presentation coordinates,
 * taking viewport size and scale into account.
 *
 * Do not construct directly – use ScrollTriggerDescriptorBuilder instead.
 */
export class ScrollTriggerDescriptor {
  private start_: Expression;
  private end_: Expression;

  constructor(options: {
    presentation: Presentation;
    start: Expression;
    startViewOffset?: number;
    end: Expression;
    endViewOffset?: number;
  }) {
    const { start, end } = options;

    this.start_ = start;
    this.end_ = end;
  }

  /**
   * Evaluate the configured start expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerDescriptorBuilder.
   */
  get start(): number {
    return this.start_.evaluate();
  }

  /**
   * Evaluate the configured end expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerDescriptorBuilder.
   */
  get end(): number {
    return this.end_.evaluate();
  }
}
