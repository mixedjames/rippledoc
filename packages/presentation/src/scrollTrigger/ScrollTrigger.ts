import { Expression } from "@rippledoc/expressions";
import { Presentation } from "../model/Presentation";
import { TypedEmitter } from "./TypedEmitter";

type ScrollTriggerEvents = {
  start: { progress: number };
  end: { progress: number };
  reverseStart: { progress: number };
  reverseEnd: { progress: number };
  scroll: { progress: number };
};

/**
 * Immutable descriptor for a scroll trigger window within a Presentation.
 *
 * This type is responsible for turning expression-based definitions of
 * scroll positions into concrete values in presentation coordinates,
 * taking viewport size and scale into account.
 *
 * Do not construct directly – use ScrollTriggerBuilder instead.
 */
export class ScrollTrigger {
  private readonly name_: string;
  private start_: Expression;
  private end_: Expression;

  private listeners_ = new TypedEmitter<ScrollTriggerEvents>();

  constructor(options: {
    presentation: Presentation;
    start: Expression;
    startViewOffset?: number;
    end: Expression;
    endViewOffset?: number;
    name?: string;
  }) {
    const { start, end, name } = options;

    this.name_ = name ?? "";
    this.start_ = start;
    this.end_ = end;
  }

  /**
   * Subscribe to scroll trigger events. Returns an unsubscribe function.
   */
  on = this.listeners_.on.bind(this.listeners_);

  /**
   * Emit a scroll trigger event. Not intended for external use.
   */
  emit = this.listeners_.emit.bind(this.listeners_);

  /**
   * Optional name for this trigger, when defined via the builder/XML.
   */
  get name(): string {
    return this.name_;
  }

  /**
   * Evaluate the configured start expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerBuilder.
   */
  get start(): number {
    return this.start_.evaluate();
  }

  /**
   * Evaluate the configured end expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerBuilder.
   */
  get end(): number {
    return this.end_.evaluate();
  }
}
