import { describe, it, expect } from "vitest";
import { hasCyclicalDependencies } from "./HasCyclicalDependencies";
import { parseExpression } from "../parser/Parser";
import { DefaultBindingContext } from "../DefaultBindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";

function bindNamedExpressions(
  definitions: Record<string, string>,
): UncheckedExpression[] {
  const ctx = new DefaultBindingContext();

  const unboundByName: Record<string, ReturnType<typeof parseExpression>> = {};

  for (const [name, expr] of Object.entries(definitions)) {
    const unbound = parseExpression(expr);
    unboundByName[name] = unbound;
    ctx.addValueExpression(name, unbound);
  }

  return Object.keys(unboundByName).map((name) =>
    unboundByName[name]!.bind(ctx),
  );
}

describe("hasCyclicalDependencies", () => {
  it("returns false for acyclic dependencies", () => {
    const expressions = bindNamedExpressions({
      a: "1 + 2",
      b: "a * 3",
      c: "b - 4",
    });

    expect(hasCyclicalDependencies(expressions)).toBe(false);
  });

  it("returns true when a simple cycle exists", () => {
    const expressions = bindNamedExpressions({
      a: "b + 1",
      b: "a + 1",
    });

    expect(hasCyclicalDependencies(expressions)).toBe(true);
  });
});
