import type { BindingContext } from "../parser/BindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import { AstNode } from "../parser/AST";
import { UnboundExpression } from "../expressions/UnboundExpression";

/**
 * AST node that wraps a native JavaScript function.
 *
 * Participates in the standard expression lifecycle but skips
 * dependency tracking and symbolic binding.
 */
class NativeFunctionNode extends AstNode {
  private readonly nativeFn_: () => number;

  /**
   * Create a new native function node.
   *
   * @param nativeFn The JavaScript function to call during evaluation.
   */
  constructor(nativeFn: () => number) {
    super();
    if (typeof nativeFn !== "function") {
      throw new Error("NativeFunctionNode requires a function");
    }
    this.nativeFn_ = nativeFn;
  }

  /**
   * Bind operation is a no-op for native functions.
   * Returns self since there's nothing to bind.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    return this;
  }

  /**
   * Resolve operation is a no-op for native functions.
   * Returns self since there's nothing to resolve.
   */
  override resolve(): AstNode {
    return this;
  }

  /**
   * Native functions have no dependencies.
   */
  override getDependencies(): UncheckedExpression[] {
    return [];
  }

  /**
   * Evaluate by calling the native function.
   */
  override evaluate(): number {
    return this.nativeFn_();
  }
}

/**
 * Create an UnboundExpression that wraps a native JavaScript function.
 *
 * The returned expression participates in the standard expression lifecycle
 * (bind → resolve → evaluate) but delegates evaluation to the provided function.
 * Native expressions have no dependencies on other expressions.
 */
export function createNativeExpression(
  nativeFn: () => number,
): UnboundExpression {
  const astNode = new NativeFunctionNode(nativeFn);
  return new UnboundExpression(astNode);
}
