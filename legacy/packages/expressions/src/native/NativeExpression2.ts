import type { BindingContext } from "../parser/BindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import { AstNode } from "../parser/AST";
import { UnboundExpression } from "../expressions/UnboundExpression";
import { NameType } from "../parser/NameType";

/**
 * Unbound AST node for a native JavaScript function.
 *
 * During bind(), dependency names are looked up symbolically in the
 * BindingContext and converted into link functions. The result of
 * binding is an UncheckedNativeFunctionNode that owns those links.
 */
class UnboundNativeFunctionNode extends AstNode {
  private readonly nativeFn_: () => number;
  private readonly dependencyNames_: string[];

  private uncheckedNativeFunctionNode_: UncheckedNativeFunctionNode | null =
    null;

  /**
   * Create a new unbound native function node.
   *
   * @param nativeFn The JavaScript function to call during evaluation.
   * @param dependencies Optional list of dependency names (dot-separated).
   */
  constructor(nativeFn: () => number, dependencies: string[] = []) {
    super();
    if (typeof nativeFn !== "function") {
      throw new Error("UnboundNativeFunctionNode requires a function");
    }
    this.nativeFn_ = nativeFn;
    this.dependencyNames_ = dependencies;
  }

  /**
   * Bind this node by capturing dependency link functions from the context.
   *
   * Returns an UncheckedNativeFunctionNode that owns the dependency links.
   */
  override bind(context: BindingContext): AstNode {
    const dependencies = this.dependencyNames_.map((d) => {
      return context.lookupName(d.split("."), NameType.VALUE);
    });
    this.uncheckedNativeFunctionNode_ = new UncheckedNativeFunctionNode(
      this.nativeFn_,
      dependencies,
    );
    return this.uncheckedNativeFunctionNode_;
  }

  /**
   * Unbound native nodes cannot be resolved directly.
   */
  override resolve(): AstNode {
    throw new Error("UnboundNativeFunctionNode cannot be resolved");
  }

  /**
   * Unbound native nodes do not expose dependencies directly.
   *
   * Dependencies are managed by the UncheckedNativeFunctionNode produced
   * during bind().
   */
  override getDependencies(): UncheckedExpression[] {
    throw new Error("UnboundNativeFunctionNode is unbound.");
  }

  get uncheckedNativeFunctionNode(): UncheckedNativeFunctionNode {
    if (this.uncheckedNativeFunctionNode_ === null) {
      throw new Error(
        "UncheckedNativeFunctionNode is not available until after binding",
      );
    }
    return this.uncheckedNativeFunctionNode_;
  }
}
/**
 * Bound (unchecked) AST node for a native function.
 *
 * Holds link functions to dependencies discovered during bind(). When
 * getDependencies() is first called, those links are invoked to
 * materialise concrete UncheckedExpression dependencies. During
 * resolve(), this node produces the final NativeFunctionNode.
 */
class UncheckedNativeFunctionNode extends AstNode {
  private readonly nativeFn_: () => number;
  private readonly dependencies_: (() => UncheckedExpression)[];

  private linkedDependencies_: UncheckedExpression[] | null = null;
  private nativeFunctionNode_: NativeFunctionNode | null = null;

  constructor(
    nativeFn: () => number,
    dependencies: (() => UncheckedExpression)[],
  ) {
    super();
    if (typeof nativeFn !== "function") {
      throw new Error("UncheckedNativeFunctionNode requires a function");
    }
    this.nativeFn_ = nativeFn;
    this.dependencies_ = dependencies;
  }

  /**
   * Unchecked native nodes cannot be rebound.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("UncheckedNativeFunctionNode cannot be rebound");
  }

  /**
   * Resolve this node into the final NativeFunctionNode.
   */
  override resolve(): AstNode {
    this.nativeFunctionNode_ = new NativeFunctionNode(this.nativeFn_);
    return this.nativeFunctionNode_;
  }

  /**
   * Return the concrete UncheckedExpression dependencies of this node.
   *
   * Dependency link functions are invoked lazily and cached.
   */
  override getDependencies(): UncheckedExpression[] {
    this.ensureLinkedDependencies();
    return this.linkedDependencies_!;
  }

  private ensureLinkedDependencies(): void {
    if (this.linkedDependencies_ === null) {
      this.linkedDependencies_ = this.dependencies_.map((linkFn) => linkFn());
    }
  }

  get nativeFunctionNode(): NativeFunctionNode {
    if (this.nativeFunctionNode_ === null) {
      throw new Error(
        "NativeFunctionNode is not available until after resolution",
      );
    }
    return this.nativeFunctionNode_;
  }
}
/**
 * Resolved AST node for a native function.
 *
 * Represents the final, dependency-free node used during evaluation.
 * The wrapped function can be replaced at runtime.
 */
class NativeFunctionNode extends AstNode {
  private nativeFn_: () => number;

  constructor(nativeFn: () => number) {
    super();
    if (typeof nativeFn !== "function") {
      throw new Error("NativeFunctionNode requires a function");
    }
    this.nativeFn_ = nativeFn;
  }

  /**
   * NativeFunctionNode instances cannot be rebound.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("NativeFunctionNode cannot be rebound");
  }

  /**
   * NativeFunctionNode instances are already resolved.
   */
  override resolve(): AstNode {
    throw new Error("NativeFunctionNode cannot be resolved");
  }

  override evaluate(): number {
    return this.nativeFn_();
  }

  get nativeFunction(): () => number {
    return this.nativeFn_;
  }

  replaceNativeFunction(newFn: () => number): void {
    if (typeof newFn !== "function") {
      throw new Error("replaceNativeFunction requires a function");
    }
    this.nativeFn_ = newFn;
  }
}

export interface NativeExpression2 {
  unboundExpression: UnboundExpression;
  replaceNativeFunction: (newFn: () => number) => void;
}

/**
 * Create an UnboundExpression that wraps a native JavaScript function.
 *
 * This version (vs createNativeExpression) extends native expressions to support:
 * 1. Optional dependencies that can be linked during the bind phase using
 *    string names (including dot-separated module paths).
 * 2. The ability to replace the native function at runtime, after the
 *    expression has been bound and resolved.
 *
 * Important Note:
 * If you change the native function after compilation, you must ensure that the new function
 * has dependencies that are compatible with the original function. The system cannot perform any
 * checks to verify this compatibility.
 *
 * In particular it is possible to introduce a cyclical dependency resulting in infinite recursion.
 *
 * This function exists mainly to solve bootstrapping issues. As such, clients should probably
 * discard the replaceNativeFunction capability after initial setup to avoid accidental misuse.
 *
 */
export function createNativeExpression2(
  nativeFn: () => number,
  dependencies: string[] = [],
): NativeExpression2 {
  const astNode = new UnboundNativeFunctionNode(nativeFn, dependencies);
  return {
    unboundExpression: new UnboundExpression(astNode),
    replaceNativeFunction(newFn: () => number) {
      astNode.uncheckedNativeFunctionNode.nativeFunctionNode.replaceNativeFunction(
        newFn,
      );
    },
  };
}
