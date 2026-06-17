import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";

export class StylesPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;

  constructor(state: EditorState, push: PushOperation) {
    this.state_ = state;
    this.push_ = push;
    this.element = document.createElement("div");
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = "Styles coming soon.";
    this.element.appendChild(msg);
  }

  update(): void {}

  dispose(): void {}
}
