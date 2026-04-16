import { BindingContext, NoSuchNameException } from "./BindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import { AstNode } from "./AST";
import { BindingError } from "./Parser";

/**
 * Unbound function call expression.
 *
 * Mirrors NameExpression but uses the FUNCTION namespace and
 * additionally carries a list of argument AST nodes.
 *
 * Examples:
 *   f()
 *   f(a, b)
 *   module.fn(1, x + 2)
 */
export class FunctionExpression extends AstNode {
  private readonly parts_: readonly string[];
  private readonly args_: readonly AstNode[];

  constructor(parts: readonly string[], args: readonly AstNode[]) {
    super();
    this.parts_ = parts;
    this.args_ = args;
  }

  getParts(): readonly string[] {
    return this.parts_;
  }

  getArgs(): readonly AstNode[] {
    return this.args_;
  }

  override getDependencies(): UncheckedExpression[] {
    throw new Error("Unbound FunctionExpression cannot get dependencies");
  }

  override bind(context: BindingContext): AstNode {
    try {
      const boundArgs = this.args_.map((arg) => arg.bind(context));
      const functionName = this.parts_.join(".");
      const callable = context.lookupFunction(functionName);

      return new LinkedFunctionExpression(boundArgs, callable);
    } catch (error) {
      if (error instanceof NoSuchNameException) {
        throw new BindingError(this.parts_.join("."));
      }

      throw error;
    }
  }
}

class LinkedFunctionExpression extends AstNode {
  private readonly args_: readonly AstNode[];
  private readonly fn_: (args: readonly number[]) => number;

  constructor(
    args: readonly AstNode[],
    fn: (args: readonly number[]) => number,
  ) {
    super();
    this.args_ = args;
    this.fn_ = fn;
  }

  override getDependencies(): UncheckedExpression[] {
    const deps: UncheckedExpression[] = [];
    for (const arg of this.args_) {
      deps.push(...arg.getDependencies());
    }
    return deps;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("LinkedFunctionExpression cannot be rebound");
  }

  override resolve(): AstNode {
    const resolvedArgs = this.args_.map((arg) => arg.resolve());
    return new ResolvedFunctionExpression(this.fn_, resolvedArgs);
  }
}

class ResolvedFunctionExpression extends AstNode {
  private readonly args_: AstNode[];
  private readonly fn_: (args: readonly number[]) => number;

  constructor(fn: (args: readonly number[]) => number, args: AstNode[]) {
    super();
    this.fn_ = fn;
    this.args_ = args;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("ResolvedFunctionExpression cannot be rebound");
  }

  override resolve(): AstNode {
    throw new Error("ResolvedFunctionExpression is already resolved");
  }

  override getDependencies(): UncheckedExpression[] {
    throw new Error("ResolvedFunctionExpression cannot get dependencies");
  }

  override evaluate(): number {
    const argValues = this.args_.map((arg) => arg.evaluate());
    return this.fn_(argValues);
  }
}
