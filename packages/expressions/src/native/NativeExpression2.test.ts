import { describe, it, expect } from "vitest";
import { DefaultBindingContext } from "../DefaultBindingContext";
import { createNativeExpression } from "./NativeExpression";
import { createNativeExpression2 } from "./NativeExpression2";

function evalNative2(fn: () => number): number {
  const { unboundExpression } = createNativeExpression2(fn);
  const ctx = new DefaultBindingContext();
  const dep = unboundExpression.bind(ctx);
  const resolved = dep.resolve();
  return resolved.evaluate();
}

describe("NativeExpression2", () => {
  it("evaluates native functions through the expression pipeline", () => {
    const result = evalNative2(() => 123);
    expect(result).toBe(123);
  });

  it("tracks dependencies via BindingContext and enforces resolution order", () => {
    const ctx = new DefaultBindingContext();

    // Base expression that others can depend on
    const baseUnbound = createNativeExpression(() => 42);
    ctx.addValueExpression("base", baseUnbound);

    // Native expression declaring a dependency on "base"
    const { unboundExpression: nativeUnbound } = createNativeExpression2(
      () => 1,
      ["base"],
    );

    const baseUnchecked = baseUnbound.bind(ctx);
    const nativeUnchecked = nativeUnbound.bind(ctx);

    // Cannot resolve native expression until base is resolved
    expect(() => nativeUnchecked.resolve()).toThrow(
      /Unresolved dependencies exist/,
    );

    // Once base is resolved, native can resolve successfully
    baseUnchecked.resolve();
    const nativeExpression = nativeUnchecked.resolve();

    expect(nativeExpression.evaluate()).toBe(1);
  });

  it("allows replacing the native function after bind/resolve", () => {
    const { unboundExpression, replaceNativeFunction } = createNativeExpression2(
      () => 1,
    );

    const ctx = new DefaultBindingContext();
    const dep = unboundExpression.bind(ctx);
    const resolved = dep.resolve();

    // Initial behaviour
    expect(resolved.evaluate()).toBe(1);

    // Swap implementation
    replaceNativeFunction(() => 10);

    expect(resolved.evaluate()).toBe(10);
  });

  it("throws if constructed with a non-function at runtime", () => {
    // Bypass TypeScript's type checking intentionally
    // to verify the runtime guard.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badValue: any = 42;
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createNativeExpression2(badValue as () => number),
    ).toThrow(/UnboundNativeFunctionNode requires a function/);
  });
});
