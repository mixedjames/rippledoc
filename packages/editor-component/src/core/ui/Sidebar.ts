import type { EditorState } from "../EditorState";
import type { EditOperation } from "../history/EditOperation";
import type { AnchorPickResult } from "../tools/AnchorPickerTool";
import { CollapsiblePanel } from "./panels/CollapsiblePanel";
import { StylesPanel } from "./panels/StylesPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { AnchorsPanel } from "./panels/AnchorsPanel";
import type { SidebarPanel } from "./panels/SidebarPanel";

export class Sidebar {
  readonly element: HTMLElement;
  private panels_: SidebarPanel[];

  constructor(
    state: EditorState,
    push: (op: EditOperation) => void,
    requestPick: (callback: (result: AnchorPickResult) => void) => void,
  ) {
    this.element = document.createElement("div");
    this.element.className = "re-sidebar";

    const styles = new StylesPanel(state, push);
    const properties = new PropertiesPanel(state, push);
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
