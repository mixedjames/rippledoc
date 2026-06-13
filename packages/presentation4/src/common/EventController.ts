import { TypedEmitter } from "./TypedEmitter";

/**
 * Wraps TypedEmitter with three emission modes:
 *   normal  — events fire immediately (default)
 *   session — events are buffered and replayed in order on endSession()
 *   disabled — events are silently dropped
 *
 * emit() is intentionally not part of PresentationEventSource — it is internal
 * to the Core layer. Consumers see only the PresentationEventSource subset.
 */
export class EventController<E extends Record<string, unknown>> {
  private readonly emitter_ = new TypedEmitter<E>();
  private mode_: "normal" | "session" | "disabled" = "normal";
  // Closures rather than typed tuples — avoids generic variance issues at replay.
  private buffer_: Array<() => void> = [];

  on<K extends keyof E>(
    event: K,
    listener: (payload: E[K]) => void,
  ): () => void {
    return this.emitter_.on(event, listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    if (this.mode_ === "disabled") return;
    if (this.mode_ === "session") {
      this.buffer_.push(() => this.emitter_.emit(event, payload));
      return;
    }
    this.emitter_.emit(event, payload);
  }

  beginSession(): void {
    this.mode_ = "session";
  }

  endSession(): void {
    const fns = this.buffer_;
    this.buffer_ = [];
    this.mode_ = "normal";
    for (const fn of fns) fn();
  }

  withEventsDisabled(fn: () => void): void {
    const prev = this.mode_;
    this.mode_ = "disabled";
    try {
      fn();
    } finally {
      this.mode_ = prev;
    }
  }
}
