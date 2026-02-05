export function resolveExpressions(dependentExpressions) {

  if (!Array.isArray(dependentExpressions)) {
    throw new Error("No dependent expressions provided.");
  }

  const resolvedExpressions = [];
  let passes = 0;

  for (let j = 0; j < dependentExpressions.length; j++) {

    let madeProgress = false;
    let unresolvedCount = false;

    passes++;

    for (let i = 0; i < dependentExpressions.length; i++) {

      const de = dependentExpressions[i];

      if (!de.isResolved()) {
        unresolvedCount++;

        if (!de.hasUnresolvedDependencies()) {
          unresolvedCount--;
          resolvedExpressions.push(de.resolve());
          madeProgress = true;
        }
      }

    } // for(i)

    if (unresolvedCount == 0) {
      // No unresolved expressions found so we must be done.
      break;
    }

    if (!madeProgress) {
      console.log("Remaining expressions with unresolved dependencies:", dependentExpressions);
      throw new Error("Circular dependency detected among expressions.");
    }

  } // for(j)

  console.log(`Resolved in ${passes} passes.`);

  return resolvedExpressions;
}