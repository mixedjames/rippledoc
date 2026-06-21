import type { Element } from "@rippledoc/presentation4";
import type { MarkdownElement } from "@rippledoc/presentation4";
import type { BitmapImageElement } from "@rippledoc/presentation4";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";

function isMarkdown(el: Element): el is MarkdownElement {
  return "markdown" in el;
}

function isBitmapImage(el: Element): el is BitmapImageElement {
  // BitmapImageElement is the only element type with `alt`
  return "alt" in el;
}

export class PropertiesPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;

  private push_: PushOperation;

  constructor(state: EditorState, push: PushOperation) {
    this.state_ = state;
    this.push_ = push;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.element.innerHTML = "";
    const sel = this.state_.viewController.selection.elements;

    if (sel.size === 0) {
      this.renderEmpty_("No element selected.");
      return;
    }
    if (sel.size > 1) {
      this.renderEmpty_(`${sel.size} elements selected.`);
      return;
    }

    // sel.size === 1 is checked above; cast is safe
    const element = sel.values().next().value as Element;
    if (isMarkdown(element)) {
      this.renderMarkdownProps_(element);
    } else if (isBitmapImage(element)) {
      this.renderImageProps_(element);
    } else {
      this.renderEmpty_("SVG element selected.");
    }
  }

  private renderEmpty_(message: string): void {
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = message;
    this.element.appendChild(msg);
  }

  private renderMarkdownProps_(el: MarkdownElement): void {
    const label = document.createElement("div");
    label.textContent = `Markdown element`;
    this.element.appendChild(label);
    // TODO: inline markdown editor (delegates to EditorDelegate.requestTextEdit)
    const preview = document.createElement("pre");
    preview.style.cssText =
      "margin:4px 0;font-size:10px;overflow:hidden;white-space:pre-wrap;max-height:80px";
    preview.textContent = el.markdown;
    this.element.appendChild(preview);
  }

  private renderImageProps_(el: BitmapImageElement): void {
    const label = document.createElement("div");
    label.textContent = `Image element`;
    this.element.appendChild(label);
    // TODO: src/alt inputs (delegates to EditorDelegate.requestImageImport)
    const src = document.createElement("div");
    src.style.cssText =
      "margin-top:4px;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
    src.textContent = el.src || "(no source)";
    this.element.appendChild(src);
  }

  dispose(): void {}
}
