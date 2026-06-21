import {
  createPresentation,
  type Presentation,
  type PresentationOptions,
  type PresentationMemento,
} from "@rippledoc/presentation4";
import { NullPresentationView } from "@rippledoc/presentation4/viewAPI";
import { createEditorView } from "@rippledoc/view-editor";
import type { EditorViewController } from "@rippledoc/view-editor";
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
import { Sidebar } from "./ui/Sidebar";
import { injectEditorStyles } from "./ui/EditorStyles";
import type { EditorTool, EditorToolContext } from "./tools/EditorTool";
import type { EditOperation } from "./history/EditOperation";
import { SingleSelectorTool } from "./tools/SingleSelectorTool";
import { MultiSelectorTool } from "./tools/MultiSelectorTool";
import { AnchorPickerTool } from "./tools/AnchorPickerTool";
import type { AnchorPickResult } from "./tools/AnchorPickerTool";

const NULL_TOOL: EditorTool = Object.freeze({ activate() {}, deactivate() {} });

export class EditorComponentImpl implements EditorComponent {
  private readonly delegate_: EditorDelegate;
  private readonly layout_: EditorLayout;
  private readonly sidebar_: Sidebar;
  private readonly state_: EditorState;
  private readonly history_: OperationHistory;
  private readonly emitter_: TypedEmitter<EditorEvents>;

  private activeTool_: EditorTool = NULL_TOOL;
  private selectionUnsub_: () => void = () => {};

  constructor(delegate: EditorDelegate) {
    this.delegate_ = delegate;
    this.layout_ = new EditorLayout();
    this.history_ = new OperationHistory();
    this.emitter_ = new TypedEmitter();
    injectEditorStyles();

    // Always start with a presentation so state is never null.
    const presentation = createPresentation();
    const viewController = createEditorView({ container: this.layout_.canvas });
    presentation.attachView(viewController.viewFactory);
    this.state_ = new EditorState(presentation, viewController);

    this.sidebar_ = new Sidebar(
      this.state_,
      (op) => this.pushOperation_(op),
      (cb) => this.requestPick_(cb),
    );
    this.layout_.element.appendChild(this.sidebar_.element);

    this.selectionUnsub_ = viewController.events.on(
      "selection:changed",
      ({ elements, sections }) => {
        this.emitter_.emit("selectionChanged", { elements, sections });
        this.sidebar_.update();
      },
    );
    this.activateTool_(this.state_.activeToolId);
  }

  get element(): HTMLElement {
    return this.layout_.element;
  }

  get events(): EditorEventSource {
    return this.emitter_;
  }

  newPresentation(options?: PresentationOptions): Presentation {
    this.teardownPresentation_();

    const presentation = createPresentation(options);
    const viewController = createEditorView({ container: this.layout_.canvas });
    presentation.attachView(viewController.viewFactory);

    this.state_.presentation = presentation;
    this.state_.viewController = viewController;
    this.state_.isDirty = false;

    this.selectionUnsub_ = viewController.events.on(
      "selection:changed",
      ({ elements, sections }) => {
        this.emitter_.emit("selectionChanged", { elements, sections });
        this.sidebar_.update();
      },
    );

    this.activateTool_(this.state_.activeToolId);
    this.history_.clear();
    this.sidebar_.update();
    this.emitter_.emit("dirty", { isDirty: false });
    this.emitter_.emit("commandStateChanged", {});

    return presentation;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadPresentation(_memento: PresentationMemento): void {
    throw new Error("loadPresentation not yet implemented");
  }

  getMemento(): PresentationMemento {
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
    return true;
  }

  private switchTool_(id: EditorToolId): void {
    this.activeTool_.deactivate();
    this.state_.activeToolId = id;
    this.activateTool_(id);
    this.emitter_.emit("toolChanged", { tool: id });
  }

  private activateTool_(id: EditorToolId): void {
    this.activeTool_ = this.createTool_(id);
    this.activeTool_.activate(this.makeContext_(this.state_.viewController));
  }

  private makeContext_(vc: EditorViewController): EditorToolContext {
    return {
      viewEvents: vc.events,
      selection: vc.selection,
      state: this.state_,
      pushOperation: (op) => this.pushOperation_(op),
    };
  }

  private requestPick_(callback: (result: AnchorPickResult) => void): void {
    const vc = this.state_.viewController;
    const previousTool = this.activeTool_;
    this.activeTool_.deactivate();

    const onDone = (result: AnchorPickResult) => {
      this.activeTool_.deactivate();
      this.activeTool_ = previousTool;
      previousTool.activate(this.makeContext_(vc));
      callback(result);
    };

    const pickerTool = new AnchorPickerTool(onDone);
    this.activeTool_ = pickerTool;
    pickerTool.activate(this.makeContext_(vc));
  }

  private pushOperation_(op: EditOperation): void {
    this.history_.push(op);
    this.markDirty_();
    this.emitter_.emit("commandStateChanged", {});
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
    this.activeTool_.deactivate();
    this.activeTool_ = NULL_TOOL;
    this.selectionUnsub_();
    this.selectionUnsub_ = () => {};
    // CorePresentation.attachView() calls this.view_.destroy() before swapping,
    // which removes the EditorPresentationView's root div from the canvas.
    this.state_.presentation.attachView(() => new NullPresentationView());
  }
}
