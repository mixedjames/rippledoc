import type { MarkdownElement } from "@rippledoc/presentation4";
import type { EditorState } from "../EditorState";
import type { EditOperation } from "../history/EditOperation";
import type { AnchorPickResult } from "../tools/AnchorPickerTool";
import { CollapsiblePanel } from "./panels/CollapsiblePanel";
import { StylesPanel } from "./panels/StylesPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { AnchorsPanel } from "./panels/AnchorsPanel";
import type { SidebarPanel } from "./panels/SidebarPanel";

/**
 * Assembles and owns the three sidebar panels: Styles, Properties, and Anchors.
 * Each panel is wrapped in a `CollapsiblePanel` chrome and appended to the sidebar element.
 *
 * The sidebar does not subscribe to any events directly. Instead,
 * `EditorComponentImpl` calls `update()` whenever the selection changes, and
 * the sidebar fans it out to every panel. Panels fully re-render their content on
 * each update (innerHTML reset + rebuild) rather than diffing — acceptable at this
 * scale, and simpler than tracking incremental state.
 *
 * Panels receive `push` (the operation write path) and `requestPick` (the anchor
 * pick interrupt) rather than a reference to `EditorComponentImpl` directly,
 * keeping the coupling narrow and the panel interfaces easy to test.
 */
export class Sidebar {
  readonly element: HTMLElement;
  private panels_: SidebarPanel[];

  constructor(
    state: EditorState,
    push: (op: EditOperation) => void,
    requestPick: (callback: (result: AnchorPickResult) => void) => void,
    openMarkdownEditor: (element: MarkdownElement) => void,
  ) {
    this.element = document.createElement("div");
    this.element.className = "re-sidebar";

    const styles = new StylesPanel(state, push);
    const properties = new PropertiesPanel(state, push, openMarkdownEditor);
    const anchors = new AnchorsPanel(state, push, requestPick);
    this.panels_ = [styles, properties, anchors];

    this.element.appendChild(
      new CollapsiblePanel("Styles", styles.element).element,
    );
    this.element.appendChild(
      new CollapsiblePanel("Properties", properties.element).element,
    );
    this.element.appendChild(
      new CollapsiblePanel("Anchors", anchors.element).element,
    );
  }

  update(): void {
    for (const panel of this.panels_) {
      panel.update();
    }
  }

  dispose(): void {
    for (const panel of this.panels_) {
      panel.dispose();
    }
  }
}
