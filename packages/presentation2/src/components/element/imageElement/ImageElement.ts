import { Element, ElementOptions, ElementPhase2Constructor } from "../Element";

export enum ImageFit {
  Fill = "fill",
  Contain = "contain",
  Cover = "cover",
}

export type ImageElementOptions = {
  elementOptions: ElementOptions;
  source: string;
  fit: ImageFit;
};

export class ImageElement extends Element {
  private readonly source_: string;
  private readonly fit_: ImageFit;

  constructor(token: symbol, options: ImageElementOptions) {
    super(token, options.elementOptions);

    this.source_ = options.source;
    this.fit_ = options.fit;
  }

  static createImageElement(options: ImageElementOptions): {
    element: ImageElement;
    phase2Constructor: ElementPhase2Constructor;
  } {
    const element = new ImageElement(Element.constructionToken_, options);
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
    throw new Error("Use createImageElement to create an ImageElement");
  }

  get source(): string {
    return this.source_;
  }

  get fit(): ImageFit {
    return this.fit_;
  }
}
