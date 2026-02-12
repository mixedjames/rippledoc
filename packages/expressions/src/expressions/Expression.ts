import type { AstNode } from "../parser/AST";

/**
 * Wrapper around a resolved AST (phase 3).
 */
export class Expression {
  private readonly root_: AstNode;

  constructor(root: AstNode) {
    if (!root) {
      throw new Error("Expression requires AST root");
    }
    this.root_ = root;
  }

  evaluate(): number {
    return this.root_.evaluate();
  }
}
