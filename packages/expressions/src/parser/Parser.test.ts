import { describe, it, expect } from "vitest";
import { parseExpression } from "./Parser";
import { DefaultBindingContext } from "../DefaultBindingContext";

/**
 * Helper to bind, resolve, and evaluate an expression string
 * using the default binding context.
 */
function evalExpression(expr: string): number {
  const unbound = parseExpression(expr);
  const ctx = new DefaultBindingContext();
  const dep = unbound.bind(ctx);
  const resolved = dep.resolve();
  return resolved.evaluate();
}

describe("Parser", () => {
  it("parses and evaluates simple numeric literals", () => {
    expect(evalExpression("42")).toBe(42);
    expect(evalExpression("3.14")).toBeCloseTo(3.14);
  });

  it("parses unary minus", () => {
    expect(evalExpression("-5")).toBe(-5);
    expect(evalExpression("--5")).toBe(5);
  });

  it("parses binary operators with correct precedence", () => {
    // 1 + 2 * 3 = 7
    expect(evalExpression("1 + 2 * 3")).toBe(7);

    // (1 + 2) * 3 = 9
    expect(evalExpression("(1 + 2) * 3")).toBe(9);

    // 10 - 4 / 2 = 8
    expect(evalExpression("10 - 4 / 2")).toBe(8);

    // 7 % 4 + 1 = 4 (7 % 4 = 3, 3 + 1 = 4)
    expect(evalExpression("7 % 4 + 1")).toBe(4);
  });

  it("throws on unexpected trailing tokens", () => {
    expect(() => parseExpression("1 2")).toThrow(/Unexpected token/);
  });

  it("throws on invalid primary", () => {
    expect(() => parseExpression("@")).toThrow(
      /Expected number, identifier, or '\('/,
    );
  });
});
