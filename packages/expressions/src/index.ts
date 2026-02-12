/** @packageDocumentation
 *
 * This package provides support for the RippleDoc expressions system:
 * - Parsing expressions
 * - Building a system of interdependent expressions
 * - Compiling that system into executable form
 *
 * # For Users of the Expressions System
 *
 * Start with {@link Module}. You can use this to build a system of expressions which can be
 * compiled into an executable form ({@link Expression}).
 *
 * You can also you use it to setup complex relationships between Modules such as:
 * - Giving modules parents so that they can inherit expressions
 * - Importing modules into other modules so that they can use their expressions via member access
 *
 * You shouldn't need anything else - if you find yourself burrowing into the package more deeply,
 * let me know!
 *
 * # For Maintainers of the Expressions System
 *
 * You will, no doubt, need to delve more deeply into the inner workings of the system.
 *
 * The package is organized into subdirectories by subcomponent. There is a natural order
 * and components at a lower level should never reference dependent components.
 *
 * As such there it probably makes sense to read the code in the following order:
 * 1. Lexer
 * 2. Parser
 * 3. Expressions
 * 4. Modules
 */

export { Module } from "./modules/Module";
export { Expression } from "./expressions/Expression";
