import type {
  Element,
  MarkdownElement,
  BitmapImageElement,
  SVGImageElement,
  ImageFit,
  ScrollTrigger,
  Section,
} from "@rippledoc/presentation4";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";

function isMarkdown(el: Element): el is MarkdownElement {
  return "markdown" in el;
}

function isBitmapImage(el: Element): el is BitmapImageElement {
  return "alt" in el;
}

function isSVGImage(el: Element): el is SVGImageElement {
  return "subComponent" in el;
}

/**
 * Sidebar panel that shows element-type-specific properties for a single selected element.
 */
export class PropertiesPanel implements SidebarPanel {
  readonly title = "Properties";
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private openMarkdownEditor_: (element: MarkdownElement) => void;
  private requestImageImport_: () => Promise<{ src: string } | null>;

  constructor(
    state: EditorState,
    push: PushOperation,
    openMarkdownEditor: (element: MarkdownElement) => void,
    requestImageImport: () => Promise<{ src: string } | null>,
  ) {
    this.state_ = state;
    this.push_ = push;
    this.openMarkdownEditor_ = openMarkdownEditor;
    this.requestImageImport_ = requestImageImport;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.element.innerHTML = "";
    const sel = this.state_.viewController.selection;

    if (sel.triggers.size === 1) {
      const trigger = sel.triggers.values().next().value as ScrollTrigger;
      this.renderTriggerNameRow_(trigger);
      this.renderTypeLabel_("Scroll trigger");
      return;
    }
    if (sel.triggers.size > 1) {
      this.renderEmpty_(`${sel.triggers.size} triggers selected.`);
      return;
    }

    if (sel.sections.size === 1) {
      const section = sel.sections.values().next().value as Section;
      this.renderSectionNameRow_(section);
      this.renderTypeLabel_("Section");
      return;
    }
    if (sel.sections.size > 1) {
      this.renderEmpty_(`${sel.sections.size} sections selected.`);
      return;
    }

    if (sel.elements.size === 0) {
      this.renderEmpty_("No element selected.");
      return;
    }
    if (sel.elements.size > 1) {
      this.renderEmpty_(`${sel.elements.size} elements selected.`);
      return;
    }

    // sel.elements.size === 1 is checked above; cast is safe
    const element = sel.elements.values().next().value as Element;
    this.renderNameRow_(element);

    if (isMarkdown(element)) {
      this.renderMarkdownProps_(element);
    } else if (isBitmapImage(element)) {
      this.renderBitmapImageProps_(element);
    } else if (isSVGImage(element)) {
      this.renderSVGImageProps_(element);
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

  private renderSectionNameRow_(section: Section): void {
    const row = document.createElement("div");
    row.className = "re-style-row";

    const label = document.createElement("span");
    label.className = "re-style-row__label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "re-style-input re-style-input--text";
    input.value = section.name;

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
      if (newName === "" || newName === section.name) {
        input.value = section.name;
        error.style.display = "none";
        return;
      }

      const isDuplicate = section.root
        .getSections()
        .some((other) => other !== section && other.name === newName);
      if (isDuplicate) {
        error.textContent = `"${newName}" is already in use.`;
        error.style.display = "";
        input.value = section.name;
        return;
      }

      error.style.display = "none";
      const oldName = section.name;
      this.push_({
        execute: () => section.setName(newName),
        undo: () => section.setName(oldName),
      });
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        input.value = section.name;
        error.style.display = "none";
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

  private renderBitmapImageProps_(el: BitmapImageElement): void {
    this.renderTypeLabel_("Image element");

    const src = document.createElement("div");
    src.className = "re-prop-src";
    src.textContent = el.src || "(no source)";
    this.element.appendChild(src);

    const changeBtn = document.createElement("button");
    changeBtn.className = "re-panel-action-btn";
    changeBtn.textContent = "Change source…";
    changeBtn.addEventListener("click", () => {
      void this.requestImageImport_().then((result) => {
        if (!result) return;
        const oldSrc = el.src;
        this.push_({
          execute: () => el.setSrc(result.src),
          undo: () => el.setSrc(oldSrc),
        });
        src.textContent = result.src;
      });
    });
    this.element.appendChild(changeBtn);

    // Alt text
    const altRow = document.createElement("div");
    altRow.className = "re-style-row";
    const altLabel = document.createElement("span");
    altLabel.className = "re-style-row__label";
    altLabel.textContent = "Alt";
    const altWrap = document.createElement("div");
    altWrap.className = "re-style-row__value";
    const altInput = document.createElement("input");
    altInput.type = "text";
    altInput.className = "re-style-input re-style-input--text";
    altInput.value = el.alt;
    altWrap.appendChild(altInput);
    altRow.appendChild(altLabel);
    altRow.appendChild(altWrap);
    this.element.appendChild(altRow);

    const commitAlt = () => {
      const newAlt = altInput.value;
      if (newAlt === el.alt) return;
      const oldAlt = el.alt;
      this.push_({
        execute: () => el.setAlt(newAlt),
        undo: () => el.setAlt(oldAlt),
      });
    };
    altInput.addEventListener("blur", commitAlt);
    altInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        altInput.blur();
      } else if (e.key === "Escape") {
        altInput.value = el.alt;
        altInput.blur();
      }
    });

    // Fit selector
    const fitRow = document.createElement("div");
    fitRow.className = "re-style-row";
    const fitLabel = document.createElement("span");
    fitLabel.className = "re-style-row__label";
    fitLabel.textContent = "Fit";
    const fitWrap = document.createElement("div");
    fitWrap.className = "re-style-row__value";
    const fitSelect = document.createElement("select");
    fitSelect.className = "re-style-select";
    const fitOptions: { value: ImageFit; label: string }[] = [
      { value: "contain", label: "Contain" },
      { value: "cover", label: "Cover" },
      { value: "fill", label: "Fill" },
      { value: "none", label: "None" },
    ];
    for (const { value, label } of fitOptions) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      if (value === el.objectFit) opt.selected = true;
      fitSelect.appendChild(opt);
    }
    fitSelect.addEventListener("change", () => {
      const newFit = fitSelect.value as ImageFit;
      const oldFit = el.objectFit;
      this.push_({
        execute: () => el.setObjectFit(newFit),
        undo: () => el.setObjectFit(oldFit),
      });
    });
    fitWrap.appendChild(fitSelect);
    fitRow.appendChild(fitLabel);
    fitRow.appendChild(fitWrap);
    this.element.appendChild(fitRow);
  }

  private renderSVGImageProps_(el: SVGImageElement): void {
    this.renderTypeLabel_("SVG image");

    const src = document.createElement("div");
    src.className = "re-prop-src";
    src.textContent = el.src || "(no source)";
    this.element.appendChild(src);

    const changeBtn = document.createElement("button");
    changeBtn.className = "re-panel-action-btn";
    changeBtn.textContent = "Change source…";
    changeBtn.addEventListener("click", () => {
      void this.requestImageImport_().then((result) => {
        if (!result) return;
        const oldSrc = el.src;
        this.push_({
          execute: () => el.setSrc(result.src),
          undo: () => el.setSrc(oldSrc),
        });
        src.textContent = result.src;
      });
    });
    this.element.appendChild(changeBtn);
  }

  dispose(): void {}
}
