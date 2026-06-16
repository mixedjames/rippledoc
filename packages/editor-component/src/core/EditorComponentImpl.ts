import {
  createPresentation,
  type PresentationOptions,
  type PresentationMemento,
} from "@rippledoc/presentation4";
import { createEditorView } from "@rippledoc/view-editor";
import type { EditorComponent } from "../clientAPI/EditorComponent";
import type {
  EditorCommandId,
  EditorToolId,
} from "../clientAPI/EditorCommands";
import type { EditorDelegate } from "../clientAPI/EditorDelegate";
import type {
  EditorEvents,
  EditorEventSource,
} from "../clientAPI/EditorEvents";
import { TypedEmitter } from "./TypedEmitter";
import { EditorState } from "./EditorState";
import { OperationHistory } from "./history/OperationHistory";
import { EditorLayout } from "./ui/EditorLayout";
import type { EditorTool, EditorToolContext } from "./tools/EditorTool";
import { SingleSelectorTool } from "./tools/SingleSelectorTool";
import { MultiSelectorTool } from "./tools/MultiSelectorTool";

export class EditorComponentImpl implements EditorComponent {
  private readonly delegate_: EditorDelegate;
  private readonly layout_: EditorLayout;
  private readonly state_: EditorState;
  private readonly history_: OperationHistory;
  private readonly emitter_: TypedEmitter<EditorEvents>;

  private activeTool_: EditorTool | null = null;
  private selectionUnsub_: (() => void) | null = null;

  constructor(delegate: EditorDelegate) {
    this.delegate_ = delegate;
    this.layout_ = new EditorLayout();
    this.state_ = new EditorState();
    this.history_ = new OperationHistory();
    this.emitter_ = new TypedEmitter();
  }

  get element(): HTMLElement {
    return this.layout_.element;
  }

  get events(): EditorEventSource {
    return this.emitter_;
  }

  newPresentation(options?: PresentationOptions): void {
    this.teardownPresentation_();

    const presentation = createPresentation(options);
    const viewController = createEditorView({ container: this.layout_.canvas });
    presentation.attachView(viewController.viewFactory);

    this.state_.presentation = presentation;
    this.state_.viewController = viewController;
    this.state_.isDirty = false;

    this.selectionUnsub_ = viewController.events.on(
      "selection:changed",
      ({ selection }) => {
        this.emitter_.emit("selectionChanged", { selection });
      },
    );

    this.activateTool_(this.state_.activeToolId);
    this.history_.clear();
    this.emitter_.emit("dirty", { isDirty: false });
    this.emitter_.emit("commandStateChanged", {});
  }

  loadPresentation(_memento: PresentationMemento): void {
    throw new Error("loadPresentation not yet implemented");
  }

  getMemento(): PresentationMemento {
    if (!this.state_.presentation) throw new Error("No presentation loaded");
    return this.state_.presentation.toMemento();
  }

  exec(command: EditorCommandId): void {
    if (!this.canExec(command)) return;

    if (command === "undo") {
      this.history_.undo();
      this.emitter_.emit("commandStateChanged", {});
      return;
    }
    if (command === "redo") {
      this.history_.redo();
      this.emitter_.emit("commandStateChanged", {});
      return;
    }
    if (command.startsWith("tool:")) {
      const toolId = command.slice("tool:".length) as EditorToolId;
      this.switchTool_(toolId);
      return;
    }
  }

  canExec(command: EditorCommandId): boolean {
    if (command === "undo") return this.history_.canUndo();
    if (command === "redo") return this.history_.canRedo();
    if (command.startsWith("tool:")) return true;
    return this.state_.presentation !== null;
  }

  private switchTool_(id: EditorToolId): void {
    this.activeTool_?.deactivate();
    this.state_.activeToolId = id;
    this.activateTool_(id);
    this.emitter_.emit("toolChanged", { tool: id });
  }

  private activateTool_(id: EditorToolId): void {
    const vc = this.state_.viewController;
    if (!vc) return;

    this.activeTool_ = this.createTool_(id);
    const context: EditorToolContext = {
      viewEvents: vc.events,
      selection: vc.selection,
      state: this.state_,
      pushOperation: (op) => {
        this.history_.push(op);
        this.markDirty_();
        this.emitter_.emit("commandStateChanged", {});
      },
    };
    this.activeTool_.activate(context);
  }

  private createTool_(id: EditorToolId): EditorTool {
    switch (id) {
      case "singleSelect":
        return new SingleSelectorTool();
      case "multiSelect":
        return new MultiSelectorTool();
    }
  }

  private markDirty_(): void {
    if (!this.state_.isDirty) {
      this.state_.isDirty = true;
      this.emitter_.emit("dirty", { isDirty: true });
    }
  }

  private teardownPresentation_(): void {
    this.activeTool_?.deactivate();
    this.activeTool_ = null;
    this.selectionUnsub_?.();
    this.selectionUnsub_ = null;
    this.state_.presentation = null;
    this.state_.viewController = null;
  }
}
