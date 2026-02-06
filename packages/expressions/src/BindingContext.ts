import { NameType } from "./NameType";
import type { DependentExpression } from "./DependentExpression";
import type { UnboundExpression } from "./UnboundExpression";

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

type Provider = () => DependentExpression;

/**
 * Default implementation of the binding context.
 *
 * Supports:
 *   - Direct name → expression provider
 *   - Optional parent delegation
 *   - Subcontexts for member access (a.b.c)
 *
 * Names are additionally partitioned by NameType (VALUE, ARRAY, FUNCTION).
 */
export class DefaultBindingContext implements BindingContext {

	private readonly parent: DefaultBindingContext | null;

	// Map<string, Map<NameType, Provider>>
	private readonly symbols = new Map<string, Map<NameType, Provider>>();

	// Map<string, DefaultBindingContext>
	private readonly subcontexts = new Map<string, DefaultBindingContext>();

	constructor(parent: DefaultBindingContext | null = null) {
		this.parent = parent;
	}

	addValueExpression(name: string, provider: UnboundExpression): void {
		this.addExpression(name, NameType.VALUE, provider);
	}

	/**
	 * Register an expression under a name and type.
	 */
	addExpression(name: string, type: NameType, provider: UnboundExpression): void {

		if (!name) {
			throw new Error("Name required");
		}

		if (!type) {
			throw new Error("NameType required");
		}

		if (!provider) {
			throw new Error("Provider (UnboundExpression) required");
		}

		let typeMap = this.symbols.get(name);

		if (!typeMap) {
			typeMap = new Map<NameType, Provider>();
			this.symbols.set(name, typeMap);
		}

		if (typeMap.has(type)) {
			throw new Error(`Duplicate symbol: ${name}`);
		}

		typeMap.set(type, () => provider.dependentExpression);
	}

	/**
	 * Register a subcontext under a name.
	 *
	 * Used for member access: a.b
	 */
	addSubcontext(name: string, context: DefaultBindingContext): void {

		if (!name) {
			throw new Error("Name required");
		}

		if (!context) {
			throw new Error("Context required");
		}

		if (this.subcontexts.has(name)) {
			throw new Error(`Duplicate subcontext: ${name}`);
		}

		this.subcontexts.set(name, context);
	}

	lookupName(parts: string[], type: NameType): Provider {

		if (!Array.isArray(parts) || parts.length === 0) {
			throw new Error("Name parts required");
		}

		return this.lookupRecursive(parts, type);
	}

	private lookupRecursive(parts: string[], type: NameType): Provider {

		const head = parts[0];
    if (!head) {
      throw new Error("Invalid name part");
    }

		// Final name
		if (parts.length === 1) {

			// Check local symbols
			const typeMap = this.symbols.get(head);

			if (typeMap && typeMap.has(type)) {
				// Non-null assertion is safe due to has(type) guard
				return typeMap.get(type)!;
			}

			// Delegate to parent
			if (this.parent) {
				return this.parent.lookupName([head], type);
			}

			throw new Error(`Unresolved name: ${head}`);
		}

		// Subcontext traversal
		if (this.subcontexts.has(head)) {
			const sub = this.subcontexts.get(head)!;
			return sub.lookupName(parts.slice(1), type);
		}

		// Delegate to parent
		if (this.parent) {
			return this.parent.lookupName(parts, type);
		}

		throw new Error(`'${head}' is not an object`);
	}
}
