type Listener<E, K extends keyof E> = (payload: E[K]) => void;

/**
 * Minimal typed event emitter — no external dependency, no string-keyed `any`.
 *
 * Generic over `E`, an event map (`{ eventName: PayloadType }`). TypeScript narrows
 * the payload type at the call site through the `K extends keyof E` constraint, so
 * both `on` and `emit` are fully type-safe without casts.
 *
 * `on` returns a zero-argument unsubscribe closure rather than requiring a remove call
 * with the original listener reference. Callers store the returned function and call it
 * when done — the same pattern used by `EditorEventSource` in the public API.
 */
export class TypedEmitter<E extends Record<string, unknown>> {
  private listeners_: { [K in keyof E]?: Set<Listener<E, K>> } = {};

  on<K extends keyof E>(event: K, listener: Listener<E, K>): () => void {
    let set = this.listeners_[event];
    if (!set) {
      set = new Set();
      this.listeners_[event] = set;
    }
    set.add(listener);
    return () => set.delete(listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this.listeners_[event];
    if (!set) return;
    for (const listener of set) listener(payload);
  }
}
