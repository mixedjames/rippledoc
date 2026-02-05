// Expression.js
//
// Wrapper around a bound AST.

export class Expression {

  #root;

  constructor(root) {
    if (!root) {
      throw new Error("Expression requires AST root");
    }
    this.#root = root;
  }

  evaluate() {
    return this.#root.evaluate();
  }

}
