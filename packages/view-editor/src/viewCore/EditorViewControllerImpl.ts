import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { TypedEmitter } from "./TypedEmitter";
import type { ViewMode } from "../clientAPI/ViewMode";
import type {
  EditorViewEvents,
  EditorViewEventSource,
} from "../clientAPI/EditorViewEvents";
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
  private readonly elementSet_: Set<p4.Element> = new Set();
  private readonly sectionSet_: Set<p4.Section> = new Set();
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
      this.elementSet_,
      this.sectionSet_,
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
    // controller.selection.hasElement() in their own constructors.
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
    this.emitter_.emit("selection:changed", {
      elements: this.elementSet_ as ReadonlySet<p4.Element>,
      sections: this.sectionSet_ as ReadonlySet<p4.Section>,
    });
  }
}

// Private to this module — consumers see only EditorSelectionController.
class EditorSelectionControllerImpl implements EditorSelectionController {
  private readonly ctrl_: EditorViewControllerImpl;
  private readonly elementSet_: Set<p4.Element>;
  private readonly sectionSet_: Set<p4.Section>;

  constructor(
    ctrl: EditorViewControllerImpl,
    elementSet: Set<p4.Element>,
    sectionSet: Set<p4.Section>,
  ) {
    this.ctrl_ = ctrl;
    this.elementSet_ = elementSet;
    this.sectionSet_ = sectionSet;
  }

  // ── Element ops ─────────────────────────────────────────────────────────────

  addElement(element: p4.Element): void {
    const clearedSections = this.clearSectionsIfNeeded_();
    if (!this.elementSet_.has(element)) {
      this.elementSet_.add(element);
      this.ctrl_.onSelectionChanged();
    } else if (clearedSections) {
      this.ctrl_.onSelectionChanged();
    }
  }

  removeElement(element: p4.Element): void {
    if (this.elementSet_.has(element)) {
      this.elementSet_.delete(element);
      this.ctrl_.onSelectionChanged();
    }
  }

  setElements(elements: Iterable<p4.Element>): void {
    this.sectionSet_.clear();
    this.elementSet_.clear();
    for (const el of elements) this.elementSet_.add(el);
    this.ctrl_.onSelectionChanged();
  }

  hasElement(element: p4.Element): boolean {
    return this.elementSet_.has(element);
  }

  get elements(): ReadonlySet<p4.Element> {
    return this.elementSet_;
  }

  // ── Section ops ─────────────────────────────────────────────────────────────

  addSection(section: p4.Section): void {
    const clearedElements = this.clearElementsIfNeeded_();
    if (!this.sectionSet_.has(section)) {
      this.sectionSet_.add(section);
      this.ctrl_.onSelectionChanged();
    } else if (clearedElements) {
      this.ctrl_.onSelectionChanged();
    }
  }

  removeSection(section: p4.Section): void {
    if (this.sectionSet_.has(section)) {
      this.sectionSet_.delete(section);
      this.ctrl_.onSelectionChanged();
    }
  }

  setSections(sections: Iterable<p4.Section>): void {
    this.elementSet_.clear();
    this.sectionSet_.clear();
    for (const s of sections) this.sectionSet_.add(s);
    this.ctrl_.onSelectionChanged();
  }

  hasSection(section: p4.Section): boolean {
    return this.sectionSet_.has(section);
  }

  get sections(): ReadonlySet<p4.Section> {
    return this.sectionSet_;
  }

  // ── Combined ops ────────────────────────────────────────────────────────────

  clear(): void {
    if (this.elementSet_.size > 0 || this.sectionSet_.size > 0) {
      this.elementSet_.clear();
      this.sectionSet_.clear();
      this.ctrl_.onSelectionChanged();
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Clears sections if any are selected. Returns true if anything was cleared. */
  private clearSectionsIfNeeded_(): boolean {
    if (this.sectionSet_.size > 0) {
      this.sectionSet_.clear();
      return true;
    }
    return false;
  }

  /** Clears elements if any are selected. Returns true if anything was cleared. */
  private clearElementsIfNeeded_(): boolean {
    if (this.elementSet_.size > 0) {
      this.elementSet_.clear();
      return true;
    }
    return false;
  }
}
