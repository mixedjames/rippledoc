import type { UncheckedExpression } from "../expressions/UncheckedExpression";

/**
 * Checks if a collection of UncheckedExpressions has cyclical dependencies.
 * Returns true if a cycle is detected, false otherwise.
 *
 */
export function hasCyclicalDependencies(
  expressions: UncheckedExpression[],
): boolean {
  if (!Array.isArray(expressions)) {
    throw new Error("No dependent expressions provided.");
  }

  if (expressions.length === 0) {
    // No expressions means no dependencies, so no cycles.
    return false;
  }

  for (let i = 0; i < expressions.length; i++) {
    switch (resolveAtLeastOne(expressions)) {
      case DependencyResolutionResult.AllDone:
        // (a) No unresolved expressions?
        //     All expressions resolved successfully, so no cycles.
        return false;

      case DependencyResolutionResult.FoundCycle:
        // (b) No progress made?
        //     Remaining expressions have unresolved dependencies that
        //     cannot be satisfied without a cycle.
        return true;

      case DependencyResolutionResult.MadeProgress:
        // (c) Made progress but still have unresolved expressions?
        //     Keep going.
        break;
    }
  }

  // If we get here, we made as many passes as there are expressions without resolving them all, so
  // a cycle must exist.
  return true;
}

enum DependencyResolutionResult {
  MadeProgress,
  AllDone,
  FoundCycle,
}

/**
 * Makes a pass through the list of UncheckedExpressions, attempting to resolve at least one.
 *
 * @returns a DependencyResolutionResult indicating the outcome of the pass
 */
function resolveAtLeastOne(
  expressions: UncheckedExpression[],
): DependencyResolutionResult {
  // False unless we resolve at least one expression in this pass.
  let madeProgress = false;

  // Count of expressions that remain unresolved after this pass.
  let unresolvedCount = 0;

  for (let i = 0; i < expressions.length; i++) {
    const de = expressions[i];

    if (!de) {
      throw new Error(
        `Dependent expression at index ${i} is null or undefined.`,
      );
    }

    if (de.isResolved()) {
      continue;
    }

    unresolvedCount++;

    if (!de.hasUnresolvedDependencies()) {
      unresolvedCount--;
      de.resolve();
      madeProgress = true;
    }
  } // end for

  // We've made a complete pass through the expressions.
  // What did we find...?

  // (a) No unresolved expressions?
  //     We must be done.
  if (unresolvedCount === 0) {
    return DependencyResolutionResult.AllDone;
  }

  if (!madeProgress) {
    // (b) No progress made?
    //     Remaining expressions have unresolved dependencies that
    //     cannot be satisfied without a cycle.
    return DependencyResolutionResult.FoundCycle;
  }

  // (c) Made progress but still have unresolved expressions?
  //     Keep going.
  return DependencyResolutionResult.MadeProgress;
}
