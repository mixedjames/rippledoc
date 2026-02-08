import type { AstNode } from "../parser/AST";
import type { BindingContext } from "../parser/BindingContext";
import { DependentExpression } from "./DependentExpression";

/**
 * Wrapper around an unbound (symbolic) AST.
 *
 * Represents phase 1 of an expression's lifecycle and owns the
 * AST until bind(context) is called.
 */
export class UnboundExpression {

	// Root AST node while unbound. Set to null after binding.
	private root: AstNode | null;

	// The DependentExpression created by binding.
	private _dependentExpression: DependentExpression | null = null;

	constructor(root: AstNode) {
		if (!root) {
			throw new Error("UnboundExpression requires non-null AST root");
		}
		this.root = root;
	}

	/**
	 * Returns true if this expression has already been bound.
	 */
	isBound(): boolean {
		return this._dependentExpression !== null;
	}

	/**
	 * Bind this expression using the provided context.
	 *
	 * After this call, ownership of the AST moves to the
	 * created DependentExpression and this wrapper becomes
	 * inert, retaining only a reference to that dependent
	 * expression.
	 */
	bind(context: BindingContext): DependentExpression {
		if (this.root === null) {
			throw new Error("Expression already bound");
		}

		const boundAst = this.root.bind(context);
		this._dependentExpression = new DependentExpression(boundAst);

		// Jump ship: UnboundExpression no longer owns the AST
		this.root = null;

		return this._dependentExpression;
	}

	/**
	 * Return the DependentExpression produced by binding.
	 * Only valid after bind() has been called.
	 */
	get dependentExpression(): DependentExpression {
		if (this._dependentExpression === null) {
			throw new Error("Expression not yet bound");
		}
		return this._dependentExpression;
	}
}
