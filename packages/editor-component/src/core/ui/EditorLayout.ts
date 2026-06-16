/** Creates and owns the top-level DOM structure for the editor component. */
export class EditorLayout {
  readonly element: HTMLElement;
  /** The viewport element that hosts the presentation canvas. */
  readonly canvas: HTMLElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "rippledoc-editor";

    this.canvas = document.createElement("div");
    this.canvas.className = "rippledoc-editor__canvas";

    this.element.appendChild(this.canvas);
  }
}
