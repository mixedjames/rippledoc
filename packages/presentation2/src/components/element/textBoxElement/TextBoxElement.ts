import { Element, ElementOptions, ElementPhase2Constructor } from "../Element";

export type TextBoxOptions = {
  elementOptions: ElementOptions;
  content: Node;
};

export class TextBoxElement extends Element {
  private readonly content_: Node;

  constructor(token: symbol, options: TextBoxOptions) {
    super(token, options.elementOptions);

    this.content_ = options.content;
  }

  get content(): Node {
    return this.content_;
  }

  static createTextBox(options: TextBoxOptions): {
    element: TextBoxElement;
    phase2Constructor: ElementPhase2Constructor;
  } {
    const element = new TextBoxElement(Element.constructionToken_, options);
    return {
      element,
      phase2Constructor: element.phase2Constructor,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createElement(options: ElementOptions): {
    element: Element;
    phase2Constructor: ElementPhase2Constructor;
  } {
    throw new Error("Use createTextBox to create a TextBoxElement");
  }
}
