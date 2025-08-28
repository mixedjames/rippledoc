import { describe, it, expect } from "vitest";
import { parseExpression } from "./parser";

describe("parseExpression", () => {
  //
  // ✅ Positive cases
  //
  it("parses simple identifiers", () => {
    expect(() => parseExpression("foo")).not.toThrow();
  });

  it("parses constants", () => {
    expect(() => parseExpression("123")).not.toThrow();
    expect(() => parseExpression("3.1415")).not.toThrow();
  });

  it("parses parenthesized expressions", () => {
    expect(() => parseExpression("(foo)")).not.toThrow();
    expect(() => parseExpression("(123)")).not.toThrow();
  });

  it("parses additive expressions", () => {
    expect(() => parseExpression("a + b")).not.toThrow();
    expect(() => parseExpression("a - b + c")).not.toThrow();
  });

  it("parses multiplicative expressions", () => {
    expect(() => parseExpression("a * b")).not.toThrow();
    expect(() => parseExpression("a / b * c")).not.toThrow();
  });

  it("parses combined additive and multiplicative expressions", () => {
    expect(() => parseExpression("a + b * c - d / e")).not.toThrow();
  });

  it("parses postfix bracket expressions", () => {
    expect(() => parseExpression("arr[0]")).not.toThrow();
    expect(() => parseExpression("matrix[1][2]")).not.toThrow();
  });

  it("parses postfix function calls (empty args only)", () => {
    expect(() => parseExpression("f()")).not.toThrow();
    expect(() => parseExpression("g().h()")).not.toThrow();
  });

  it("parses postfix member access", () => {
    expect(() => parseExpression("obj.prop")).not.toThrow();
    expect(() => parseExpression("obj.method().field")).not.toThrow();
  });

  it("handles whitespace flexibly", () => {
    expect(() => parseExpression("  a   +   b * (  c - d  ) ")).not.toThrow();
  });

  //
  // ❌ Negative cases
  //
  it("rejects empty input", () => {
    expect(() => parseExpression("")).toThrow();
  });

  it("rejects unmatched parentheses", () => {
    expect(() => parseExpression("(a + b")).toThrow();
    expect(() => parseExpression("a + b)")).toThrow();
  });

  it("rejects unmatched brackets", () => {
    expect(() => parseExpression("arr[1")).toThrow();
    expect(() => parseExpression("arr]")).toThrow();
  });

  it("rejects missing operands", () => {
    expect(() => parseExpression("+ a")).toThrow();
    expect(() => parseExpression("a *")).toThrow();
    expect(() => parseExpression("a /")).toThrow();
    expect(() => parseExpression("a -")).toThrow();
  });

  it("rejects invalid tokens", () => {
    expect(() => parseExpression("$")).toThrow();
    expect(() => parseExpression("a @ b")).toThrow();
  });

  it("rejects consecutive operators without operands", () => {
    expect(() => parseExpression("a + * b")).toThrow();
    expect(() => parseExpression("a / - b")).toThrow();
  });

  it("rejects dangling dot access", () => {
    expect(() => parseExpression("obj.")).toThrow();
  });

  it("rejects lonely parentheses or brackets", () => {
    expect(() => parseExpression("()")).toThrow();
    expect(() => parseExpression("[]")).toThrow();
  });
});
