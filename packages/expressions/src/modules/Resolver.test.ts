import { describe, it, expect } from "vitest";
import { resolveExpressions } from "./Resolver";
import { parseExpression } from "../parser/Parser";
import { DefaultBindingContext } from "../DefaultBindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";

function makeDependent(expr: string): UncheckedExpression {
  const unbound = parseExpression(expr);
  const ctx = new DefaultBindingContext();
  return unbound.bind(ctx);
}

describe("Resolver", () => {
  it("resolves independent expressions in a single pass", () => {
    const a = makeDependent("1 + 2");
    const b = makeDependent("3 * 4");

    const results = resolveExpressions([a, b]);

    expect(results).toHaveLength(2);
    expect(results[0]!.evaluate()).toBe(3);
    expect(results[1]!.evaluate()).toBe(12);
  });

  it("handles an empty list", () => {
    const results = resolveExpressions([]);
    expect(results).toEqual([]);
  });

  it("throws when input is not an array", () => {
    // @ts-expect-error intentional misuse for runtime guard
    expect(() => resolveExpressions(null)).toThrow(
      /No dependent expressions provided\./,
    );
  });
});
