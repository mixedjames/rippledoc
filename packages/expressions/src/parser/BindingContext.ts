import { NameType } from "./NameType";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";

/**
 * Marker type representing a failure to find a name.
 * Contains no data because the failing name should be apparent from the context of the call.
 */
export class NoSuchNameException extends Error {
  constructor() {
    super("No such name");
    this.name = "NoSuchNameException";
  }
}

/**
 * Represents the context used during the binding phase.
 *
 * It is responsible only for symbolic name resolution and
 * does not evaluate, resolve, or inspect dependencies.
 */
export interface BindingContext {
  /**
   * Resolve a name sequence into a link function that
   * produces a dependent expression when invoked.
   *
   * # Lookup failure
   * Throws NoSuchNameException
   *
   * # Other failures
   * Behaviour in the case of logic errors etc. is non-contractual but the implementation should
   * make a best-effort attempt to fail fast and loud.
   */
  lookupName(parts: string[], type: NameType): () => UncheckedExpression;
}
