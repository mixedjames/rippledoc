import { Presentation } from "./presentation/Presentation";
import { PresentationBuilder } from "./presentation/PresentationBuilder";
import { PresentationCompiler } from "./presentation/PresentationCompiler";

export function compilePresentation(
  from: PresentationBuilder,
): Promise<Presentation> {
  const compiler = new PresentationCompiler(from);
  return Promise.resolve(compiler.compile());
}
