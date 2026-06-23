import type {
  Element,
  MarkdownElement,
  BitmapImageElement,
} from "@rippledoc/presentation4";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";

function isMarkdown(el: Element): el is MarkdownElement {
  return "markdown" in el;
}

function isBitmapImage(el: Element): el is BitmapImageElement {
  // BitmapImageElement is the only element type with `alt`
  return "alt" in el;
}

/**
 * Sidebar panel that shows element-type-specific properties for a single selected element.
 *
 * Currently a placeholder: markdown elements show a read-only content preview;
 * bitmap image elements show the src URL. The full implementations (inline markdown
 * editor, image re-import) will delegate to `EditorDelegate` and are tracked in CLAUDE.md.
 *
 * Only renders when exactly one element is selected. Multi-selection and section
 * selections show an empty-state message.
 */
export class PropertiesPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private openMarkdownEditor_: (element: MarkdownElement) => void;

  constructor(
    state: EditorState,
    push: PushOperation,
    openMarkdownEditor: (element: MarkdownElement) => void,
  ) {
    this.state_ = state;
    this.push_ = push;
    this.openMarkdownEditor_ = openMarkdownEditor;
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
    label.className = "re-panel-label";
    label.textContent = "Markdown element";
    this.element.appendChild(label);

    const btn = document.createElement("button");
    btn.className = "re-panel-action-btn";
    btn.textContent = "Edit Markdown…";
    btn.addEventListener("click", () => {
      this.openMarkdownEditor_(el);
    });
    this.element.appendChild(btn);
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
