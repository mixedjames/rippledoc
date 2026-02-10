import { DependentExpression } from "../expressions/DependentExpression";
import { Expression } from "../expressions/Expression";
import { UnboundExpression } from "../expressions/UnboundExpression";
import { parseExpression } from "../parser/Parser";
import { createNativeExpression } from "../native/NativeExpression";
import { resolveExpressions } from "./Resolver";
import { NameType } from "../parser/NameType";
import type { BindingContext } from "../parser/BindingContext";

/**
 * Class Module exists as a higher level abstraction (Facade pattern) over the lower level
 * lexing, parsing, binding, and cyclical dependency checking processes.
 * 
 * # The Basic Idea
 * The basic idea is to create a complete set of expressions so that all referenced names are defined
 * within the module, and then compile the module to perform binding and dependency resolution. The
 * later step is hidden from the client.
 * 
 * Once compiled, callable functions implementing those expressions are returned to the client.
 * The module is frozen to prevent further modifications.
 * 
 * # Other features
 * We also support some more complex programming features:
 * 1. Submodules: supporting names that are not found in the current module being looked up in the parent module
 * 2. Mapped modules: supporting member access
 * 
 * ## Submodules
 * Modules can be connected by a parent-child relationship.
 * 
 * In the simplest case clients start with a single module - the root module.
 * This is created with Module.createRootModule().
 * 
 * However, clients may wish certain names to have different meanings in different contexts. For
 * example:
 *   - localProperty: a property that is unique in different contexts
 *   - globalProperty: a property that is shared across all contexts
 * 
 * In this case, a client would add globalProperty to the root module. They would then create a
 * submodule for each specific context and add localProperty to each submodule.
 * 
 * ## Mapped modules
 * Modules can also have names that refer to other modules. These are so-called mapped modules.
 * 
 * If submodules express a parent-child relationship, mapped modules express a sibling relationship.
 * 
 * They are important for supporting member access (e.g. moduleName.expressionName) and allowing
 * expressions to access arbitary chains of submodules (e.g. module1.module2.expressionName).
 * 
 * # Useage
 * The basic use case is as follows:
 * // 1. Create a root module using Module.createRootModule() and add some expressions
 * //    addExpression returns a function that will return the bound expression after compilation.
 * const rootModule = Module.createRootModule();
 * const getA = rootModule.addExpression("a", "1 + 2");
 * const getB = rootModule.addExpression("b", "a * 3");
 * 
 * // 2. Compile the module to perform binding and dependency resolution
 * rootModule.compile();
 * 
 * // 3. Access the bound expressions using the functions returned by addExpression
 * const a = getA(); // returns the bound expression for "a"
 * const b = getB(); // returns the bound expression for "b"
 * 
 */
export class Module {

  private compiled = false;

  /**
   * The parent module, or null if this is the root module.
   */
  private readonly parent: Module | null;

  /**
   * Submodules.
   */
  private subModules: Module[] = [];

  /**
   * Expressions defined in this module, mapped by their name.
   */
  private names: Map<string, {
    type: NameType;
    value: UnboundExpression | Module;
  }> = new Map();

  private constructor(parent: Module | null = null) {
    if (parent && parent.compiled) {
      throw new Error("Cannot create a submodule of a compiled module");
    }

    this.parent = parent;
  }

  static createRootModule(): Module {
    return new Module();
  }

  get parentModule(): Module | null {
    return this.parent;
  }

  get rootModule(): Module {
    let current: Module = this;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }

  addSubModule(): Module {
    if (this.compiled) {
      throw new Error("addSubModule: Cannot add a submodule to a compiled module");
    }

    const subModule = new Module(this);
    this.subModules.push(subModule);
    return subModule;
  }

  /**
   * Adds a named expression to the module.
   * Returns a function that, after the module is compiled, will return the bound expression.
   * 
   * @param name The name of the expression.
   * @param expression The expression string.
   * @returns A function that returns the bound expression after compilation.
   */
  addExpression(name: string, expression: string): () => Expression {
    this.assertNotCompiled("addExpression");

    if (this.names.has(name)) {
      throw new Error(`Expression with name "${name}" already exists in this module`);
    }

    const unboundExpression = parseExpression(expression);
    this.names.set(name, { type: NameType.VALUE, value: unboundExpression });

    // Return a function that will return the bound expression after compilation.
    return () => {
      if (!unboundExpression.dependentExpression || !unboundExpression.dependentExpression.expression) {
        throw new Error(`Cannot access expression "${name}" before the module is compiled`);
      }
      return unboundExpression.dependentExpression.expression;
    };
  }

  /**
   * Adds a named native expression to the module.
   * Returns a function that, after the module is compiled, will return the bound expression.
   * 
   * @param name The name of the expression.
   * @param expression The expression function.
   * @returns A function that returns the bound expression after compilation.
   */
  addNativeExpression(name: string, expression: () => number): () => Expression {
    this.assertNotCompiled("addNativeExpression");

    if (this.names.has(name)) {
      throw new Error(`Expression with name "${name}" already exists in this module`);
    }

    const unboundExpression = createNativeExpression(expression);
    this.names.set(name, { type: NameType.VALUE, value: unboundExpression });

    // Return a function that will return the bound expression after compilation.
    return () => {
      if (!unboundExpression.dependentExpression || !unboundExpression.dependentExpression.expression) {
        throw new Error(`Cannot access expression "${name}" before the module is compiled`);
      }
      return unboundExpression.dependentExpression.expression;
    };
  }

  /**
   * Mapped modules are accessed using the member access operator (e.g. moduleName.expressionName).
   * Name lookup is then delegated to the mapped module, minus the module's name (e.g. expressionName).
   * 
   * In this way, expressions can access arbitary chains of submodules.
   * 
   * Submodule can only be mapped if they share a common ancestor with the current module.
   * 
   * @param name The name by which the mapped module will be accessed.
   * @param module The module itself
   */
  mapModule(name: string, module: Module): void {
    this.assertNotCompiled("mapModule");

    if (this.names.has(name)) {
      throw new Error(`Expression with name "${name}" already exists in this module`);
    }

    if (!this.hasCommonAncestor(module)) {
      throw new Error("Mapped module must share a common ancestor with this module");
    }

    this.names.set(name, { type: NameType.OBJECT, value: module });
  }

  /**
   * Returns true if this module and the other module share
   * a common ancestor in the module tree (including either
   * module itself).
   */
  private hasCommonAncestor(other: Module): boolean {
    const ancestors = new Set<Module>();

    let current: Module | null = this;
    while (current) {
      ancestors.add(current);
      current = current.parent;
    }

    current = other;
    while (current) {
      if (ancestors.has(current)) {
        return true;
      }
      current = current.parent;
    }

    return false;
  }

  /**
   * Compiles the module and all its submodules.
   * 
   * After compilation:
   *  1. Expressions can be accessed via the functions returned by addExpression.
   *  2. No more expressions or submodules can be added.
   * 
   * Exception safety:
   * If an error occurs during compilation, the module is unrecoverably broken and should not be used
   * again. This is a trade-off to avoid the complexity of rolling back changes in case of an error.
   */
  compile(): void {
    if (this.compiled) {
      throw new Error("Module is already compiled");
    }

    if (this.parent) {
      throw new Error("Only the root module can be compiled");
    }

    this.compiled = true;
    resolveExpressions(this.bindExpressions());
  }

  /**
   * Bind all expressions in this module and its submodules.
   *
   * Each module receives its own binding context which delegates
   * upwards to the parent module's context. This mirrors the
   * behaviour of DefaultBindingContext (upwards and sideways
   * delegation) while keeping the binding process internal to
   * the modules package.
   */
  private bindExpressions(): DependentExpression[] {
    const context: BindingContext = {
      lookupName: this.lookupName.bind(this),
    };

    const bound: DependentExpression[] = [];

    // Bind all value expressions defined in this module.
    for (const entry of this.names.values()) {
      if (entry.type === NameType.VALUE) {
        const unbound = entry.value as UnboundExpression;
        bound.push(unbound.bind(context));
      }
    }

    // Recursively bind submodules.
    for (const sub of this.subModules) {
      bound.push(...sub.bindExpressions());
    }

    return bound;
  }

  /**
   * Throws an exception (type unspecified) if the module is already compiled.
   * Returns having no side-effects otherwise.
   */
  private assertNotCompiled(functionName: string): void {
    if (this.compiled) {
      throw new Error(`Cannot modify a compiled module: ${functionName}`);
    }
  }

  /**
   * Exists to implement BindingContext for the bindExpressions process.
   * It is private to keep the public interface clean and we will build a wrapper around it
   * as we need it.
   */
  private lookupName(parts: string[], type: NameType): () => DependentExpression {
    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("Name parts required");
    }

    const [head, ...rest] = parts;

    if (!head) {
      throw new Error("Invalid name part");
    }

    const entry = this.names.get(head);

    // Final name part: expect a value expression.
    if (rest.length === 0) {

      if (entry && entry.type === type && entry.type === NameType.VALUE) {
        const unbound = entry.value as UnboundExpression;
        return () => unbound.dependentExpression;
      }

      // Delegate to parent module if available.
      if (this.parent) {
        return this.parent.lookupName(parts, type);
      }

      throw new Error(`Unresolved name: ${head}`);
    }

    // There are remaining parts: expect an object (mapped module) for the head.
    if (entry && entry.type === NameType.OBJECT) {
      const mappedModule = entry.value as Module;
      return mappedModule.lookupName(rest, type);
    }

    // Delegate to parent if head is not a local object.
    if (this.parent) {
      return this.parent.lookupName(parts, type);
    }

    throw new Error(`'${head}' is not an object`);
  }

}