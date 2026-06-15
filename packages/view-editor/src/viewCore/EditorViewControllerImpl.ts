import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { TypedEmitter } from "./TypedEmitter";
import type { ViewMode } from "../clientAPI/ViewMode";
import type { EditorViewEvents, EditorViewEventSource } from "../clientAPI/EditorViewEvents";
import type { EditorSelectionController } from "../clientAPI/EditorSelectionController";
import type { EditorViewController } from "../clientAPI/EditorViewController";

/**
 * What the controller needs from whichever presentation view is currently
 * attached. A structural interface keeps EditorViewControllerImpl free of any
 * import of EditorPresentationView, preventing a circular dependency:
 * EditorPresentationView imports EditorViewControllerImpl to wire the factory;
 * the controller must not import back.
 */
interface AttachedView {
  applyMode(mode: ViewMode): void;
}

/** Internal implementation of EditorViewController. Not exported from the package. */
export class EditorViewControllerImpl implements EditorViewController {
  // Owned state — persists across view lifecycle.
  private mode_: ViewMode = "editor";
  private readonly selectionSet_: Set<p4.Element> = new Set();
  private readonly selection_: EditorSelectionControllerImpl;
  private readonly emitter_ = new TypedEmitter<EditorViewEvents>();

  // Null when no presentation view is currently attached.
  private view_: AttachedView | null = null;

  // Set once by createEditorView() immediately after construction, before
  // this object is returned to callers. Non-null thereafter.
  private viewFactory_: p4.PresentationViewFactory | null = null;

  constructor() {
    this.selection_ = new EditorSelectionControllerImpl(
      this,
      this.selectionSet_,
    );
  }

  // Called once by createEditorView() to complete the bootstrap.
  setFactory(factory: p4.PresentationViewFactory): void {
    this.viewFactory_ = factory;
  }

  get viewFactory(): p4.PresentationViewFactory {
    return this.viewFactory_!;
  }

  get events(): EditorViewEventSource {
    return this.emitter_;
  }

  get mode(): ViewMode {
    return this.mode_;
  }

  setMode(mode: ViewMode): void {
    this.mode_ = mode;
    this.view_?.applyMode(mode);
  }

  get selection(): EditorSelectionController {
    return this.selection_;
  }

  // ── Called by EditorPresentationView ────────────────────────────────────────

  registerView(view: AttachedView): void {
    this.view_ = view;
    // Replay current mode onto the newly attached view so it is immediately
    // consistent with whatever was set before attachView() was called.
    view.applyMode(this.mode_);
    // Selection is not replayed here — element views self-initialise from
    // controller.selection.has() in their own constructors.
  }

  unregisterView(): void {
    this.view_ = null;
  }

  emit<K extends keyof EditorViewEvents>(
    event: K,
    payload: EditorViewEvents[K],
  ): void {
    this.emitter_.emit(event, payload);
  }

  // ── Called by EditorSelectionControllerImpl ──────────────────────────────────

  onSelectionChanged(): void {
    const s = this.selectionSet_ as ReadonlySet<p4.Element>;
    this.emitter_.emit("selection:changed", { selection: s });
  }
}

// Private to this module — consumers see only EditorSelectionController.
class EditorSelectionControllerImpl implements EditorSelectionController {
  private readonly ctrl_: EditorViewControllerImpl;
  private readonly set_: Set<p4.Element>;

  constructor(ctrl: EditorViewControllerImpl, set: Set<p4.Element>) {
    this.ctrl_ = ctrl;
    this.set_ = set;
  }

  add(element: p4.Element): void {
    if (!this.set_.has(element)) {
      this.set_.add(element);
      this.ctrl_.onSelectionChanged();
    }
  }

  remove(element: p4.Element): void {
    if (this.set_.has(element)) {
      this.set_.delete(element);
      this.ctrl_.onSelectionChanged();
    }
  }

  set(elements: Iterable<p4.Element>): void {
    this.set_.clear();
    for (const el of elements) this.set_.add(el);
    this.ctrl_.onSelectionChanged();
  }

  clear(): void {
    if (this.set_.size > 0) {
      this.set_.clear();
      this.ctrl_.onSelectionChanged();
    }
  }

  has(element: p4.Element): boolean {
    return this.set_.has(element);
  }

  get elements(): ReadonlySet<p4.Element> {
    return this.set_;
  }
}
