import "../css/styles.css";

import { Module } from "@expressions";

interface Definition {
	name: string;
	expression: string;
	line: number;
}

interface EvaluationResult {
	name: string;
	value: number;
}

window.addEventListener("DOMContentLoaded", () => {
	const input = document.getElementById("expr-input") as HTMLTextAreaElement | null;
	const button = document.getElementById("evaluate-btn") as HTMLButtonElement | null;
	const results = document.getElementById("results") as HTMLDivElement | null;
	const status = document.getElementById("status") as HTMLSpanElement | null;

	if (!input || !button || !results) {
		// Nothing to wire up if the expected elements are missing.
		return;
	}

	// Seed with a small example.
	if (!input.value) {
		input.value = [
			"# Lines starting with # are ignored",
			"width = 120",
			"height = 80",
			"area = width * height",
			"perimeter = 2 * (width + height)",
		].join("\n");
	}

	button.addEventListener("click", () => {
		if (status) {
			status.textContent = "Evaluating…";
		}

		try {
			const { results: values, errors } = evaluateNamedExpressions(
				input.value,
			);

			renderResults(results, values, errors);

			if (status) {
				status.textContent = errors.length
					? `Completed with ${errors.length} error${errors.length === 1 ? "" : "s"}`
					: "Evaluation successful";
			}
		} catch (err) {
			console.error(err);
			results.innerHTML = `<p class="error-message">${escapeHtml(
				(err as Error).message ?? "Unexpected error",
			)}</p>`;
			if (status) {
				status.textContent = "Evaluation failed";
			}
		}
	});
});

function evaluateNamedExpressions(source: string): {
	results: EvaluationResult[];
	errors: string[];
} {
	const definitions = parseDefinitions(source);
	if (definitions.length === 0) {
		return { results: [], errors: ["No expressions provided."] };
	}

	const root = Module.createRootModule();
	const getters: { def: Definition; get: () => unknown }[] = [];
	const errors: string[] = [];

	// Phase 1: register all expressions with the module.
	for (const def of definitions) {
		try {
			const get = root.addExpression(def.name, def.expression);
			getters.push({ def, get });
		} catch (err) {
			errors.push(
				`Line ${def.line}: could not add '${def.name}' – ${(err as Error).message}`,
			);
		}
	}

	if (getters.length === 0) {
		return { results: [], errors };
	}

	// Phase 2: compile the module (parsing, binding, dependency resolution).
	try {
		root.compile();
	} catch (err) {
		errors.push(`Compilation error: ${(err as Error).message}`);
		return { results: [], errors };
	}

	// Phase 3: evaluate all expressions via the getters.
	const results: EvaluationResult[] = [];
	for (const { def, get } of getters) {
		try {
			// get() returns the bound Expression; evaluate() yields the value.
			const expr = get() as { evaluate: () => number };
			const value = expr.evaluate();
			results.push({ name: def.name, value });
		} catch (err) {
			errors.push(
				`Evaluation error for '${def.name}' (line ${def.line}): ${(err as Error).message}`,
			);
		}
	}

	return { results, errors };
}

function parseDefinitions(source: string): Definition[] {
	const lines = source.split(/\r?\n/);
	const definitions: Definition[] = [];

	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i];
		if (raw === undefined) {
			continue;
		}
		const lineNumber = i + 1;
		const line = raw.trim();

		if (!line || line.startsWith("#")) {
			continue;
		}

		const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
		if (!match) {
			throw new Error(
				`Line ${lineNumber}: expected 'name = expression' (got '${raw}')`,
			);
		}

		const [, name, expr] = match;
		if (!name || !expr) {
			throw new Error(
				`Line ${lineNumber}: expected 'name = expression' (got '${raw}')`,
			);
		}
		definitions.push({ name, expression: expr.trim(), line: lineNumber });
	}

	return definitions;
}

function renderResults(
	container: HTMLDivElement,
	values: EvaluationResult[],
	errors: string[],
): void {
	const parts: string[] = [];

	if (values.length) {
		parts.push("<table class=\"results-table\">");
		parts.push("<thead><tr><th>Name</th><th>Value</th></tr></thead>");
		parts.push("<tbody>");
		for (const result of values) {
			parts.push(
				`<tr><td>${escapeHtml(result.name)}</td><td>${escapeHtml(
					result.value.toString(),
				)}</td></tr>`,
			);
		}
		parts.push("</tbody></table>");
	}

	if (errors.length) {
		parts.push("<ul class=\"error-list\">");
		for (const error of errors) {
			parts.push(`<li>${escapeHtml(error)}</li>`);
		}
		parts.push("</ul>");
	}

	if (!values.length && !errors.length) {
		parts.push("<p>No results.</p>");
	}

	container.innerHTML = parts.join("");
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}