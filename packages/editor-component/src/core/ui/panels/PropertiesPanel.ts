import type {
  Element,
  MarkdownElement,
  BitmapImageElement,
  ScrollTrigger,
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
    const triggers = this.state_.viewController.selection.triggers;

    if (triggers.size === 1) {
      const trigger = triggers.values().next().value as ScrollTrigger;
      this.renderTriggerNameRow_(trigger);
      this.renderTypeLabel_("Scroll trigger");
      return;
    }
    if (triggers.size > 1) {
      this.renderEmpty_(`${triggers.size} triggers selected.`);
      return;
    }

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
    this.renderNameRow_(element);

    if (isMarkdown(element)) {
      this.renderMarkdownProps_(element);
    } else if (isBitmapImage(element)) {
      this.renderImageProps_(element);
    } else {
      this.renderTypeLabel_("SVG image");
    }
  }

  private renderEmpty_(message: string): void {
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = message;
    this.element.appendChild(msg);
  }

  private renderNameRow_(el: Element): void {
    const row = document.createElement("div");
    row.className = "re-style-row";

    const label = document.createElement("span");
    label.className = "re-style-row__label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "re-style-input re-style-input--text";
    input.value = el.name;

    const valueWrap = document.createElement("div");
    valueWrap.className = "re-style-row__value";
    valueWrap.appendChild(input);

    row.appendChild(label);
    row.appendChild(valueWrap);
    this.element.appendChild(row);

    const error = document.createElement("div");
    error.className = "re-prop-error";
    error.style.display = "none";
    this.element.appendChild(error);

    const commit = () => {
      const newName = input.value.trim();
      if (newName === "" || newName === el.name) {
        input.value = el.name;
        error.style.display = "none";
        return;
      }

      const isDuplicate = el.section
        .getElements()
        .some((other) => other !== el && other.name === newName);
      if (isDuplicate) {
        error.textContent = `"${newName}" is already in use.`;
        error.style.display = "";
        input.value = el.name;
        return;
      }

      error.style.display = "none";
      const oldName = el.name;
      this.push_({
        execute: () => el.setName(newName),
        undo: () => el.setName(oldName),
      });
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        input.value = el.name;
        error.style.display = "none";
        input.blur();
      }
    });
  }

  private renderTriggerNameRow_(trigger: ScrollTrigger): void {
    const row = document.createElement("div");
    row.className = "re-style-row";

    const label = document.createElement("span");
    label.className = "re-style-row__label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "re-style-input re-style-input--text";
    input.value = trigger.name;

    const valueWrap = document.createElement("div");
    valueWrap.className = "re-style-row__value";
    valueWrap.appendChild(input);

    row.appendChild(label);
    row.appendChild(valueWrap);
    this.element.appendChild(row);

    const commit = () => {
      const newName = input.value.trim();
      if (newName === trigger.name) return;
      const oldName = trigger.name;
      this.push_({
        execute: () => trigger.setName(newName),
        undo: () => trigger.setName(oldName),
      });
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        input.value = trigger.name;
        input.blur();
      }
    });
  }

  private renderTypeLabel_(text: string): void {
    const label = document.createElement("div");
    label.className = "re-panel-label";
    label.style.marginTop = "8px";
    label.textContent = text;
    this.element.appendChild(label);
  }

  private renderMarkdownProps_(el: MarkdownElement): void {
    this.renderTypeLabel_("Markdown element");

    const btn = document.createElement("button");
    btn.className = "re-panel-action-btn";
    btn.textContent = "Edit Markdown…";
    btn.addEventListener("click", () => {
      this.openMarkdownEditor_(el);
    });
    this.element.appendChild(btn);
  }

  private renderImageProps_(el: BitmapImageElement): void {
    this.renderTypeLabel_("Image element");

    const src = document.createElement("div");
    src.style.cssText =
      "margin-top:4px;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
    src.textContent = el.src || "(no source)";
    this.element.appendChild(src);
  }

  dispose(): void {}
}
