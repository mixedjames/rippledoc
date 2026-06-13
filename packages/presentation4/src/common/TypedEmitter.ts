/**
 *
 */
type Listener<E, K extends keyof E> = (payload: E[K]) => void;

/**
 *
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

    // return unsubscribe function (important modern practice)
    return () => set.delete(listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this.listeners_[event];
    if (!set) {
      return;
    }

    for (const listener of set) {
      listener(payload);
    }
  }

  clear<K extends keyof E>(event?: K): void {
    if (event) {
      delete this.listeners_[event];
    } else {
      this.listeners_ = {};
    }
  }
}
