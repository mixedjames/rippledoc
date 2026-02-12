import { describe, expect, it } from "vitest";
import { Module } from "./Module";

// Comprehensive tests for Module behaviour.

describe("Module basic expressions", () => {
  it("binds and evaluates simple expressions", () => {
    const root = Module.createRootModule();
    const getA = root.addExpression("a", "1 + 2");
    const getB = root.addExpression("b", "a * 3");

    root.compile();

    expect(getA().evaluate()).toBe(3);
    expect(getB().evaluate()).toBe(9);
  });

  it("throws if accessing expressions before compile", () => {
    const root = Module.createRootModule();
    const getA = root.addExpression("a", "1 + 2");

    expect(() => getA()).toThrow();
  });

  it("prevents duplicate expression names in the same module", () => {
    const root = Module.createRootModule();
    root.addExpression("a", "1");

    expect(() => root.addExpression("a", "2")).toThrow(
      /already exists in this module/,
    );
  });
});

describe("Module compilation invariants", () => {
  it("only allows the root module to be compiled", () => {
    const root = Module.createRootModule();
    const child = root.addSubModule();

    expect(() => child.compile()).toThrow(
      /Only the root module can be compiled/,
    );
  });

  it("cannot be compiled twice", () => {
    const root = Module.createRootModule();
    root.compile();

    expect(() => root.compile()).toThrow(/already compiled/);
  });

  it("cannot be modified after compilation", () => {
    const root = Module.createRootModule();
    root.addExpression("a", "1");
    const child = root.addSubModule();

    root.compile();

    expect(() => root.addExpression("b", "2")).toThrow(
      /Cannot modify a compiled module: addExpression/,
    );
    expect(() => root.addSubModule()).toThrow(
      /Cannot add a submodule to a compiled module/,
    );
    expect(() => root.mapModule("child", child)).toThrow(
      /Cannot modify a compiled module: mapModule/,
    );
  });
});

describe("Module submodules and scoping", () => {
  it("allows submodules to reference parent expressions", () => {
    const root = Module.createRootModule();
    root.addExpression("a", "1");

    const child = root.addSubModule();
    const getB = child.addExpression("b", "a + 2");

    root.compile();

    expect(getB().evaluate()).toBe(3);
  });

  it("allows submodules to shadow parent expressions", () => {
    const root = Module.createRootModule();
    root.addExpression("a", "1");

    const child = root.addSubModule();
    const getAChild = child.addExpression("a", "2");

    root.compile();

    expect(getAChild().evaluate()).toBe(2);
  });
});

describe("Module mapped modules", () => {
  it("allows mapping modules that share a common ancestor", () => {
    const root = Module.createRootModule();
    const child = root.addSubModule();

    // Mapping root into child (shared ancestor: root).
    child.mapModule("rootAlias", root);

    // Mapping child into root (shared ancestor: root).
    root.mapModule("childAlias", child);

    expect(true).toBe(true);
  });

  it("disallows mapping modules from different trees", () => {
    const root1 = Module.createRootModule();
    const root2 = Module.createRootModule();

    expect(() => {
      root1.mapModule("other", root2);
    }).toThrow(/common ancestor/);
  });

  it("supports member access through mapped modules", () => {
    const root = Module.createRootModule();
    const child = root.addSubModule();

    // Expression defined in child, but referenced via mapping from root.
    const getC = child.addExpression("c", "1 + 2");

    root.mapModule("child", child);
    const getD = root.addExpression("d", "child.c * 3");

    root.compile();

    expect(getC().evaluate()).toBe(3);
    expect(getD().evaluate()).toBe(9);
  });

  it("shares expressions when the same module is mapped in multiple places", () => {
    const root = Module.createRootModule();
    const shared = root.addSubModule();

    const getX = shared.addExpression("x", "10");

    root.mapModule("m1", shared);
    root.mapModule("m2", shared);

    const getA = root.addExpression("a", "m1.x + 1");
    const getB = root.addExpression("b", "m2.x + 2");

    root.compile();

    expect(getX().evaluate()).toBe(10);
    expect(getA().evaluate()).toBe(11);
    expect(getB().evaluate()).toBe(12);
  });
});
