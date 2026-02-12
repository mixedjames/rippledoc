import { NameType } from "./parser/NameType";
import type { DependentExpression } from "./expressions/DependentExpression";
import type { UnboundExpression } from "./expressions/UnboundExpression";
import type { BindingContext } from "./parser/BindingContext";

type Provider = () => DependentExpression;

/**
 * Default implementation of the binding context.
 *
 * Supports:
 *   - Direct name → expression provider
 *   - Optional parent delegation
 *   - Subcontexts for member access (a.b.c)
 *
 * Names are additionally partitioned by NameType (VALUE, ARRAY, FUNCTION).
 */
export class DefaultBindingContext implements BindingContext {
  private readonly parent_: DefaultBindingContext | null;

  // Map<string, Map<NameType, Provider>>
  private readonly symbols_ = new Map<string, Map<NameType, Provider>>();

  // Map<string, DefaultBindingContext>
  private readonly subcontexts_ = new Map<string, DefaultBindingContext>();

  constructor(parent: DefaultBindingContext | null = null) {
    this.parent_ = parent;
  }

  addValueExpression(name: string, provider: UnboundExpression): void {
    this.addExpression(name, NameType.VALUE, provider);
  }

  /**
   * Register an expression under a name and type.
   */
  addExpression(
    name: string,
    type: NameType,
    provider: UnboundExpression,
  ): void {
    if (!name) {
      throw new Error("Name required");
    }

    if (!type) {
      throw new Error("NameType required");
    }

    if (!provider) {
      throw new Error("Provider (UnboundExpression) required");
    }

    let typeMap = this.symbols_.get(name);

    if (!typeMap) {
      typeMap = new Map<NameType, Provider>();
      this.symbols_.set(name, typeMap);
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
   */
  addSubcontext(name: string, context: DefaultBindingContext): void {
    if (!name) {
      throw new Error("Name required");
    }

    if (!context) {
      throw new Error("Context required");
    }

    if (this.subcontexts_.has(name)) {
      throw new Error(`Duplicate subcontext: ${name}`);
    }

    this.subcontexts_.set(name, context);
  }

  lookupName(parts: string[], type: NameType): Provider {
    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("Name parts required");
    }

    return this.lookupRecursive(parts, type);
  }

  private lookupRecursive(parts: string[], type: NameType): Provider {
    const head = parts[0];
    if (!head) {
      throw new Error("Invalid name part");
    }

    // Final name
    if (parts.length === 1) {
      // Check local symbols
      const typeMap = this.symbols_.get(head);

      if (typeMap && typeMap.has(type)) {
        // Non-null assertion is safe due to has(type) guard
        return typeMap.get(type)!;
      }

      // Delegate to parent
      if (this.parent_) {
        return this.parent_.lookupName([head], type);
      }

      throw new Error(`Unresolved name: ${head}`);
    }

    // Subcontext traversal
    if (this.subcontexts_.has(head)) {
      const sub = this.subcontexts_.get(head)!;
      return sub.lookupName(parts.slice(1), type);
    }

    // Delegate to parent
    if (this.parent_) {
      return this.parent_.lookupName(parts, type);
    }

    throw new Error(`'${head}' is not an object`);
  }
}
