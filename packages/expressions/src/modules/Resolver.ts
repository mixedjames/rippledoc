import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import type { Expression } from "../expressions/Expression";

/**
 * Resolve a collection of UncheckedExpressions in dependency order.
 *
 * The algorithm repeatedly scans the list, resolving any expression
 * whose dependencies are already resolved. If in a full pass no
 * additional expressions can be resolved while unresolved ones remain,
 * a circular dependency is assumed and an error is thrown.
 */
export function resolveExpressions(
  dependentExpressions: UncheckedExpression[],
): Expression[] {
  if (!Array.isArray(dependentExpressions)) {
    throw new Error("No dependent expressions provided.");
  }

  const resolvedExpressions: Expression[] = [];

  for (let j = 0; j < dependentExpressions.length; j++) {
    let madeProgress = false;
    let unresolvedCount = 0;

    for (let i = 0; i < dependentExpressions.length; i++) {
      const de = dependentExpressions[i];
      if (!de) {
        throw new Error(
          `Dependent expression at index ${i} is null or undefined.`,
        );
      }

      if (!de.isResolved()) {
        unresolvedCount++;

        if (!de.hasUnresolvedDependencies()) {
          unresolvedCount--;
          resolvedExpressions.push(de.resolve());
          madeProgress = true;
        }
      }
    }

    if (unresolvedCount === 0) {
      // No unresolved expressions found so we must be done.
      break;
    }

    if (!madeProgress) {
      // Remaining expressions have unresolved dependencies that
      // cannot be satisfied without a cycle.
      throw new Error("Circular dependency detected among expressions.");
    }
  }

  return resolvedExpressions;
}
