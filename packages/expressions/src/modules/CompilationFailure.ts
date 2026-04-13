import { Module } from "./Module";

/**
 * Base class for representing a compilation failure that occurred during the compilation of a
 * module.
 *
 * ## Notes
 * 1. Do not directly instantiate this class. Use the specific subclass that represents the specific
 *    type of compilation failure that occurred.
 * 2. This exception and its subclasses are the public means by which Module reports failures of
 *    compilation. They should be "machine readable" and are not intended to be user readable.
 *    This is because I don't want to impose a localisation burden on the expressions module.
 */
export class CompilationFailure {
  /**
   * The module containing the expression that failed to compile.
   */
  private module_: Module;

  /**
   * The name of the expression that failed to compile.
   */
  private expressionName_: string;

  protected constructor(module: Module, expressionName: string) {
    this.module_ = module;
    this.expressionName_ = expressionName;
  }

  get module(): Module {
    return this.module_;
  }

  get expressionName(): string {
    return this.expressionName_;
  }
}

/**
 * Represents a binding failure that occurred during the compilation of a module.
 *
 * ## Notes
 * 1. The `failedNames` property contains the names that failed to resolve. This may be more than
 *    one name if the expression contains multiple names.
 */
export class BindingFailure extends CompilationFailure {
  private failedNames_: string[];

  constructor(module: Module, expressionName: string, failedNames: string[]) {
    super(module, expressionName);
    this.failedNames_ = failedNames;
  }

  get failedNames(): readonly string[] {
    return this.failedNames_;
  }
}

/**
 * Represents a cyclic dependency that was detected during the compilation of a module.
 *
 * ## Notes
 * 1. The `dependencyChain` property contains the names involved in the cyclic dependency.
 */
export class CyclicDependencyFailure extends CompilationFailure {
  private dependencyChain_: string[];

  constructor(
    module: Module,
    expressionName: string,
    dependencyChain: string[],
  ) {
    super(module, expressionName);
    this.dependencyChain_ = dependencyChain;
  }

  get dependencyChain(): readonly string[] {
    return this.dependencyChain_;
  }
}

/**
 * Represents a collection of compilation failures that occurred during the compilation of a module.
 */
export class CompilationFailuresException extends Error {
  private failures_: CompilationFailure[];

  constructor(failures: CompilationFailure[]) {
    super("Compilation failed.");
    this.name = "CompilationFailuresException";
    this.failures_ = failures;
  }

  get failures(): readonly CompilationFailure[] {
    return this.failures_;
  }
}
