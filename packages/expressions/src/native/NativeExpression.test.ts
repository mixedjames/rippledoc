import { describe, it, expect } from "vitest";
import { createNativeExpression } from "./NativeExpression";
import { DefaultBindingContext } from "../DefaultBindingContext";

function evalNative(fn: () => number): number {
  const unbound = createNativeExpression(fn);
  const ctx = new DefaultBindingContext();
  const dep = unbound.bind(ctx);
  const resolved = dep.resolve();
  return resolved.evaluate();
}

describe("NativeExpression", () => {
  it("evaluates native functions through the expression pipeline", () => {
    const result = evalNative(() => 123);
    expect(result).toBe(123);
  });

  it("can be evaluated multiple times, calling the native function each time", () => {
    let calls = 0;
    const unbound = createNativeExpression(() => {
      calls += 1;
      return 10;
    });
    const ctx = new DefaultBindingContext();
    const dep = unbound.bind(ctx);
    const resolved = dep.resolve();

    expect(resolved.evaluate()).toBe(10);
    expect(resolved.evaluate()).toBe(10);
    expect(calls).toBe(2);
  });

  it("throws if constructed with a non-function at runtime", () => {
    // Bypass TypeScript's type checking intentionally
    // to verify the runtime guard.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badValue: any = 42;
    expect(() => createNativeExpression(badValue as () => number)).toThrow(
      /NativeFunctionNode requires a function/,
    );
  });
});
