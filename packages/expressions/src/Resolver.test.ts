import { describe, it, expect } from "vitest";
import { resolveExpressions } from "./Resolver";
import { Parser } from "./Parser";
import { Lexer } from "./Lexer";
import { DefaultBindingContext } from "./BindingContext";
import type { DependentExpression } from "./DependentExpression";

function makeDependent(expr: string): DependentExpression {
	const parser = new Parser(new Lexer(expr));
	const unbound = parser.parseExpression();
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
