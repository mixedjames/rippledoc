import { NameType } from "./NameType";
import type { DependentExpression } from "../expressions/DependentExpression";

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
	 */
	lookupName(parts: string[], type: NameType): () => DependentExpression;
}
