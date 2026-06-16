/**
 * Enumerates the different kinds of named entities
 * that can be referenced in an expression.
 */
export enum NameType {
  /** Value-like name (variables, constants, etc.) */
  VALUE = "VALUE",

  /** Array-like name (indexed collections) */
  ARRAY = "ARRAY",

  /** Function-like name (callable entities) */
  FUNCTION = "FUNCTION",

  /** Object-like name (objects, modules, etc.) */
  OBJECT = "OBJECT",
}
