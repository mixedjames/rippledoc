import type { AstNode } from "../parser/AST";

/**
 * Wrapper around a resolved AST (phase 3).
 */
export class Expression {
  private readonly root: AstNode;

  constructor(root: AstNode) {
    if (!root) {
      throw new Error("Expression requires AST root");
    }
    this.root = root;
  }

  evaluate(): number {
    return this.root.evaluate();
  }
}
