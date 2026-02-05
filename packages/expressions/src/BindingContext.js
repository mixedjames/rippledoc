// BindingContext.js
//
// Context used during the binding phase.
//
// Responsible only for symbolic name resolution.
// It does NOT evaluate, resolve, or inspect dependencies.
//
// Supports:
//   - Direct name → expression provider
//   - Optional parent delegation
//   - Subcontexts for member access (a.b.c)
//
// Names are additionally partitioned by NameType (VALUE, ARRAY, FUNCTION).
//
// lookupName(parts, type) returns a *link function*:
//   () => DependentExpression
//
// This function must not be called until after all
// DependentExpressions have been constructed.

import { NameType } from "./Parser.js";

export class BindingContext {

  // ---------- Fields ----------

  #parent;

  // Map<string, Map<NameType, Provider>>
  // Provider = () => DependentExpression
  #symbols = new Map();

  // Map<string, BindingContext>
  #subcontexts = new Map();

  // ---------- Construction ----------

  /**
   * @param {BindingContext|null} parent
   */
  constructor(parent = null) {
    this.#parent = parent;
  }

  // ---------- Registration ----------

  addValueExpression(name, provider) {
    this.addExpression(name, NameType.VALUE, provider);
  }

  /**
   * Register an expression under a name and type.
   *
   * @param {string} name
   * @param {symbol} type (NameType)
   * @param {UnboundExpression} provider - UnboundExpression that will be bound
   */
  addExpression(name, type, provider) {

    if (!name) {
      throw new Error("Name required");
    }

    if (!type) {
      throw new Error("NameType required");
    }

    if (!provider) {
      throw new Error("Provider (UnboundExpression) required");
    }

    let typeMap = this.#symbols.get(name);

    if (!typeMap) {
      typeMap = new Map();
      this.#symbols.set(name, typeMap);
    }

    if (typeMap.has(type)) {
      throw new Error(`Duplicate symbol: ${name}`);
    }

    typeMap.set(type, () => provider.dependentExpression);
  }

  /**
   * Register a subcontext under a name.
   *
   * Used for member access: a.b
   *
   * @param {string} name
   * @param {BindingContext} context
   */
  addSubcontext(name, context) {

    if (!name) {
      throw new Error("Name required");
    }

    if (!context) {
      throw new Error("Context required");
    }

    if (this.#subcontexts.has(name)) {
      throw new Error(`Duplicate subcontext: ${name}`);
    }

    this.#subcontexts.set(name, context);
  }

  // ---------- Lookup ----------

  /**
   * Resolve a name sequence.
   *
   * @param {string[]} parts
   * @param {symbol} type (NameType)
   * @returns {function} () => DependentExpression
   */
  lookupName(parts, type) {

    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("Name parts required");
    }

    return this.#lookupRecursive(parts, type);
  }

  // ---------- Internal Helpers ----------

  #lookupRecursive(parts, type) {

    const head = parts[0];

    // ----- Final name -----

    if (parts.length === 1) {

      // Check local symbols
      const typeMap = this.#symbols.get(head);

      if (typeMap && typeMap.has(type)) {
        return typeMap.get(type);
      }

      // Delegate to parent
      if (this.#parent) {
        return this.#parent.lookupName([head], type);
      }

      throw new Error(`Unresolved name: ${head}`);
    }

    // ----- Subcontext traversal -----

    // Check local subcontext
    if (this.#subcontexts.has(head)) {
      const sub = this.#subcontexts.get(head);
      return sub.lookupName(parts.slice(1), type);
    }

    // Delegate to parent
    if (this.#parent) {
      return this.#parent.lookupName(parts, type);
    }

    throw new Error(`'${head}' is not an object`);
  }

}
