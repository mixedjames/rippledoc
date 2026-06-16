/**
 * A numeric value in the style system, expressed in one of two units.
 *
 * `basis` — absolute in the virtual coordinate space (same unit as anchor positions).
 *
 * `relative` — a multiplier on the resolved global style value for the same property.
 * For example, `{ unit: 'relative', value: 0.8 }` on a named style means "80% of
 * whatever the global (author override + system default) specifies for this property."
 * Relative values always resolve against the global, not the nearest cascade ancestor,
 * so they don't compound when multiple levels of the cascade use relative values.
 *
 * Global style properties and system defaults must always use `basis` units — they
 * are the base that `relative` references.
 */
export type StyleValue =
  | { unit: "basis"; value: number }
  | { unit: "relative"; value: number };
