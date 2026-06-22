export type DialogResult<T> =
  | { committed: true; value: T }
  | { committed: false };
