/**
 * Internal helper - not a public API. Subject to change without warning.
 *
 * Utility class for building an axis with constraints where:
 * - Exactly two constrains must be set for the axis to be correctly constrained.
 * - Constraints may have reasonable default values which can be overridden.
 *
 * ## A Correctly Constrained Axis
 * A correctly constrained axis has exactly two constraint expressions set. It is
 * underconstrained if fewer that two are set. It is constrained if more that two are set.
 *
 * Default values will never overconstrain an axis but can prevent an axis from being
 * underconstrained.
 *
 * ## Usage
 * const ab = new AxisBuilder(['left', 'width', 'right'] as const);
 * ab.set('left', '0');
 * ab.setDefault('right', '100');
 * ab.setDefault('width', '100');
 * console.log(ab.correctlyConstrained); // Should print: false
 */
export class AxisBuilder<T extends string> {
  private readonly keys_: readonly T[];
  private constraint_: Record<
    T,
    { expression: string | null; isDefault: boolean }
  >;

  constructor(keys: readonly T[]) {
    // eslint-disable-next-line no-magic-numbers
    if (keys.length !== 3) {
      throw new Error("AxisBuilder requires exactly 3 keys");
    }

    this.keys_ = [...keys] as readonly T[];

    this.constraint_ = Object.fromEntries(
      keys.map((k) => [k, { expression: null, isDefault: false }]),
    ) as Record<T, { expression: string | null; isDefault: boolean }>;
  }

  set(key: T, expression: string): AxisBuilder<T> {
    if (
      this.constraint_[key].expression !== null &&
      !this.constraint_[key].isDefault
    ) {
      throw new Error(`Constraint '${key}' is already set and is not default`);
    }

    this.constraint_[key] = { expression, isDefault: false };
    return this;
  }

  setDefault(key: T, expression: string): AxisBuilder<T> {
    this.constraint_[key] = { expression, isDefault: true };
    return this;
  }

  /**
   *
   */
  get correctlyConstrained(): boolean {
    // FIXME: I'm not sure how to fix this linting error
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const values = Object.values(this.constraint_) as {
      expression: string | null;
      isDefault: boolean;
    }[];

    const constraintCount = values.filter((c) => c.expression !== null).length;

    // Simplest case: exactly two constraints are set
    if (constraintCount === 2) {
      return true;
    } else if (constraintCount < 2) {
      // Underconstrained: fewer than two constraints are set, even considering defaults
      return false;
    }

    // Complex case: potential overconstrained scenario, check if any constraints are default

    const defaultConstraintCount = values.filter(
      (c) => c.expression !== null && c.isDefault,
    ).length;

    if (defaultConstraintCount == 1) {
      return true;
    }

    // Two possibilities:
    // 1. All constraints are explicitly set, so it's overconstrained
    // 2. One constraint is explicitly set and two are default, which is still overconstrained
    // because we can't know which default to ignore
    return false;
  }

  /**
   * Returns three constraint expressions, deriving the missing one from the other two.
   *
   * Assumes the keys passed to the constructor are ordered as:
   *   [start, size, end] — e.g. ['left', 'width', 'right'] or ['top', 'height', 'bottom'].
   *
   * The derived expression uses the user-provided key names, for example:
   *   right = left + width
   *   width = right - left
   *   left = right - width
   */
  deriveExpressions(): Record<T, string> {
    if (!this.correctlyConstrained) {
      throw new Error("Axis is not correctly constrained");
    }

    const keys = this.keys_ as readonly [T, T, T];
    const [k0, k1, k2] = keys;

    const constrainedKeys = keys.filter(
      (k) => this.constraint_[k].expression !== null,
    );
    const explicitKeys = constrainedKeys.filter(
      (k) => !this.constraint_[k].isDefault,
    );

    const primaryKeys: [T, T] = (() => {
      if (explicitKeys.length >= 2) {
        return [explicitKeys[0]!, explicitKeys[1]!];
      }

      if (constrainedKeys.length === 2) {
        return [constrainedKeys[0]!, constrainedKeys[1]!];
      }

      // Should not happen if correctlyConstrained is true
      throw new Error(
        "Internal error: unable to determine primary constraints",
      );
    })();

    const [p0, p1] = primaryKeys;
    const hasPrimary = (k: T) => k === p0 || k === p1;

    let derivedKey: T;
    let derivedExpression: string;

    if (hasPrimary(k0) && hasPrimary(k1)) {
      // Derive end from start and size
      derivedKey = k2;
      derivedExpression = `${String(k0)} + ${String(k1)}`;
    } else if (hasPrimary(k0) && hasPrimary(k2)) {
      // Derive size from start and end
      derivedKey = k1;
      derivedExpression = `${String(k2)} - ${String(k0)}`;
    } else if (hasPrimary(k1) && hasPrimary(k2)) {
      // Derive start from size and end
      derivedKey = k0;
      derivedExpression = `${String(k2)} - ${String(k1)}`;
    } else {
      throw new Error("Internal error: unsupported constraint combination");
    }

    const result = {} as Record<T, string>;

    for (const key of keys) {
      if (key === derivedKey) {
        result[key] = derivedExpression;
      } else {
        const entry = this.constraint_[key];
        if (entry.expression === null) {
          throw new Error(
            `Internal error: missing expression for key '${String(key)}'`,
          );
        }
        result[key] = entry.expression;
      }
    }

    return result;
  }
}
