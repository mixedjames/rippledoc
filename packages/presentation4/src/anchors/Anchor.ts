/**
 * An expression is the recipe an anchor uses to compute its value.
 *
 * Expressions are immutable values. Changing an anchor's computation means
 * replacing its expression, not mutating one. Concrete subtypes (constant,
 * offset, fraction, derived) expose their parameters for GUI editor
 * introspection; the `evaluate` method is what the anchor calls at runtime.
 */
export interface AnchorExpression {
  evaluate(): number;
  readonly dependencies: readonly Anchor[];
}

/**
 * An Anchor is a single value in the constraint-based geometry system.
 *
 * Each anchor holds a number (a position or a size in presentation units) computed
 * by its expression. Anchors that belong to a section or element are stable by
 * identity: the same anchor object is always returned for a given geometry slot and
 * layout, so callers can hold references to them safely.
 *
 * The Anchor interface is read-only. Mutation (replacing the expression) is
 * provided by concrete anchor types, keeping this interface safe to pass around
 * without granting editing rights.
 */
export interface Anchor {
  /** The current value, computed from this anchor's expression. */
  get value(): number;

  /** The expression that computes this anchor's value. */
  get expression(): AnchorExpression;

  // TODO: add `editable: boolean` here once the GUI editor design begins.
  // Editability is a property of the anchor slot (can the user change this
  // value in the editor?), not of the expression type. A constant expression
  // on a system-managed anchor should not be user-editable; the same constant
  // expression on a user-positioned element should be. The expression carries
  // no opinion on this — the anchor does.

  /**
   * Anchors whose expressions reference this anchor.
   * When this anchor's value changes, each dependent must be recomputed.
   */
  get dependents(): readonly Anchor[];

  /**
   * Anchors that this anchor's expression references.
   * Together with dependents, these two properties describe the full dependency graph.
   */
  get dependencies(): readonly Anchor[];
}
