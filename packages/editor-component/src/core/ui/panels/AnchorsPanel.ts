import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";

export class AnchorsPanel implements SidebarPanel {
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
    const sel = this.state_.viewController?.selection.elements;
    const isSingleSelection = sel?.size === 1;

    if (!isSingleSelection) {
      const msg = document.createElement("span");
      msg.className = "re-panel-empty";
      msg.textContent = "Select a single element to edit anchors.";
      this.element.appendChild(msg);
      return;
    }

    // TODO: render anchor controls; will need a view-editor "anchor:picked" event
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = "Anchor controls coming soon.";
    this.element.appendChild(msg);
  }

  dispose(): void {}
}
