/**
 * A container object which may or may not hold a non-null value.
 *
 * This class mirrors the style of Java's `Optional`. It helps avoid
 * direct null/undefined checks by providing fluent, expressive methods
 * for safe access, transformation, and fallback behavior.
 *
 * ## Example
 * ```ts
 * const maybe = Optional.makeFrom(42);
 *
 * // Safe access
 * maybe.ifPresent(v => console.log(v)); // prints "42"
 *
 * // With map
 * const doubled = maybe.map(v => v * 2);
 * console.log(doubled.get()); // 84
 *
 * // Empty optional
 * const empty = Optional.makeEmpty<number>();
 * empty.orElse(() => console.log("No value")); // prints "No value"
 * ```
 */
export class Optional<T> {
  private t_: T | null | undefined;

  /**
   * Wraps the given value in an Optional.
   * Accepts `null` or `undefined` as empty.
   */
  static makeFrom<T>(t: T | null | undefined): Optional<T> {
    return new Optional<T>(t);
  }

  /**
   * Returns an empty Optional.
   */
  static makeEmpty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  private constructor(t: T | null | undefined) {
    this.t_ = t;
  }

  /**
   * Returns the contained value.
   * Throws if empty.
   */
  get(): T {
    if (!this.present()) {
      throw new Error('Optional<T>: cannot get a missing value');
    }

    return this.t_!;
  }

  /**
   * Returns the value if present, otherwise the given default.
   * The default may be a value or a supplier function.
   */
  getOrDefault(t: T | (() => T)): T {
    if (this.present()) {
      return this.t_!;
    }

    if (t instanceof Function) {
      return t();
    } else {
      return t;
    }
  }

  /**
   * Whether a value is present.
   */
  present(): boolean {
    return this.t_ !== null && this.t_ !== undefined;
  }

  /**
   * Runs the given function if a value is present.
   * Returns this Optional for chaining.
   */
  ifPresent(f: (t: T) => void): Optional<T> {
    if (this.present()) {
      f(this.t_!);
    }
    return this;
  }

  /**
   * Throws the supplied error if no value is present.
   * Returns this Optional for chaining.
   */
  orElseThrow(f: () => object): Optional<T> {
    if (!this.present()) {
      throw f();
    }
    return this;
  }

  /**
   * Runs the given function if no value is present.
   * Returns this Optional for chaining.
   */
  orElse(f: () => void): Optional<T> {
    if (!this.present()) {
      f();
    }
    return this;
  }

  /**
   * Maps the contained value to a new Optional using the given function.
   * If empty, returns an empty Optional.
   */
  map<U>(f: (t: T) => U | null): Optional<U> {
    if (this.present()) {
      return Optional.makeFrom(f(this.t_!));
    } else {
      return Optional.makeEmpty();
    }
  }

  /**
   * Transforms the value using the given function that itself
   * returns an Optional, avoiding nested Optionals.
   * If empty, returns an empty Optional.
   */
  flatMap<U>(f: (t: T) => Optional<U>): Optional<U> {
    if (this.present()) {
      return f(this.t_!);
    } else {
      return Optional.makeEmpty();
    }
  }
} //class
