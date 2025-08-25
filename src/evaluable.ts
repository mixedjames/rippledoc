/**
 * Represents a lazily computed, cached numeric value.
 *
 * An `Evaluable` separates evaluation (computing the value) from retrieval
 * (accessing the cached result). The value may depend on other `Evaluable`s.
 * Evaluation can only proceed if all dependencies are already evaluated,
 * preventing infinite dependency cycles. Attempting to retrieve the value
 * before evaluation will throw an error.
 */
export interface Evaluable {
  /**
   * Returns the cached numeric value.
   * Throws if this has not yet been evaluated.
   */
  value(): number;

  /**
   * Whether this has already been evaluated.
   */
  evaluated(): boolean;

  /**
   * Whether this is eligible for evaluation
   * (i.e. all dependencies are evaluated).
   */
  evaluable(): boolean;

  /**
   * Computes and caches the value, if eligible.
   * Does nothing if already evaluated.
   */
  evaluate(): void;
}
