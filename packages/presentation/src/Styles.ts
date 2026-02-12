export class FillStyle {
  private color_: {
    r: number;
    g: number;
    b: number;
    a: number;
  } = { r: 0, g: 0, b: 0, a: 0 };

  private imageSource_: string = "";

  constructor(options: {
    color?: { r: number; g: number; b: number; a: number };
    imageSource?: string;
  }) {
    if (options.color) {
      this.color_ = options.color;
    }

    if (options.imageSource) {
      this.imageSource_ = options.imageSource;
    }
  }

  get color(): { r: number; g: number; b: number; a: number } {
    return { ...this.color_ };
  }

  get imageSource(): string {
    return this.imageSource_;
  }

  setColor(color: { r: number; g: number; b: number; a: number }): void {
    this.color_ = color;
  }

  setImageSource(source: string): void {
    this.imageSource_ = source;
  }

  clearImageSource(): void {
    this.imageSource_ = "";
  }
}

export class BorderStyle {}

export class Style {
  private fill_: FillStyle = new FillStyle({});
  private border_: BorderStyle = new BorderStyle();

  get fill(): FillStyle {
    return this.fill_;
  }

  get border(): BorderStyle {
    return this.border_;
  }
}
