import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { EditorSectionView } from "./EditorSectionView";
import { EditorTriggerBandView } from "./EditorTriggerBandView";
import { PresentationDOM } from "./PresentationDOM";
import { EditorViewControllerImpl } from "../EditorViewControllerImpl";
import type { EditorViewController } from "../../clientAPI/EditorViewController";
import type { ViewMode } from "../../clientAPI/ViewMode";
import type { EditorAnimationManager } from "./EditorAnimationManager";

export type EditorViewConfig = {
  /** The DOM element (or CSS selector) that the presentation renders into. */
  container: HTMLElement | string;
};

/**
 * Creates an EditorViewController backed by a new EditorPresentationView.
 *
 * Usage:
 *   const editor = createEditorView({ container: "#app" });
 *   presentation.attachView(editor.viewFactory);
 *   editor.events.on("element:picked", ({ element }) => { ... });
 *   editor.selection.addElement(someElement);
 */
export function createEditorView(
  config: EditorViewConfig,
): EditorViewController {
  const ctrl = new EditorViewControllerImpl();
  // The factory closure captures ctrl by reference. ctrl is fully initialised
  // by the time presentation.attachView() ever calls this factory.
  ctrl.setFactory((owner) => new EditorPresentationView(owner, ctrl, config));
  return ctrl;
}

export class EditorPresentationView implements p4.PresentationView {
  private readonly owner_: p4.PresentationViewOwner;
  private readonly controller_: EditorViewControllerImpl;
  private readonly dom_: PresentationDOM;
  private readonly resizeObserver_: ResizeObserver;
  private readonly onScroll_: () => void;
  private readonly onKeyDown_: (e: KeyboardEvent) => void;
  private readonly onKeyUp_: (e: KeyboardEvent) => void;

  // Tracked so destroy() can cascade to section/trigger views even in the
  // full-tree replacement path (where the model does not call destroy()).
  private readonly sectionViews_: EditorSectionView[] = [];
  private readonly triggerBandViews_: EditorTriggerBandView[] = [];
  private readonly unsubscribeTriggerAdded_: () => void;

  // Animation enable state. Starts false (editor mode); applyMode() keeps it
  // in sync with the current view mode and notifies all registered managers.
  private animationEnabled_: boolean = false;
  private readonly animationManagers_: Set<EditorAnimationManager> = new Set();

  constructor(
    owner: p4.PresentationViewOwner,
    controller: EditorViewControllerImpl,
    config: EditorViewConfig,
  ) {
    this.owner_ = owner;
    this.controller_ = controller;
    this.dom_ = new PresentationDOM(this, config.container);

    this.resizeObserver_ = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = this.dom_.viewportContainer;
      this.owner_.notifyViewResized(clientWidth, clientHeight);
    });
    this.resizeObserver_.observe(this.dom_.containerElement);

    // Convert physical scrollTop to virtual basis-space coordinates before
    // notifying the model, so trigger ranges align with anchor values.
    this.onScroll_ = () => {
      const scale = this.owner_.layoutTransform.scale;
      const scrollY =
        scale > 0 ? this.dom_.viewportContainer.scrollTop / scale : 0;
      this.owner_.notifyScrolled(scrollY);
    };
    this.dom_.viewportContainer.addEventListener("scroll", this.onScroll_);

    // Keyboard events reach the viewport only while it has focus. Focus is
    // acquired automatically when the user clicks an element (see EditorElementView).
    this.onKeyDown_ = (e: KeyboardEvent) =>
      this.controller_.emit("key:down", { source: e });
    this.onKeyUp_ = (e: KeyboardEvent) =>
      this.controller_.emit("key:up", { source: e });
    this.dom_.viewportContainer.addEventListener("keydown", this.onKeyDown_);
    this.dom_.viewportContainer.addEventListener("keyup", this.onKeyUp_);

    // Register after all listeners are wired so applyMode() can safely touch
    // the fully initialised DOM.
    this.controller_.registerView(this);

    // Initialise bands for any triggers already on the presentation, then
    // subscribe for future additions.
    for (const trigger of owner.triggers) {
      this.addTriggerBandView_(trigger);
    }
    this.unsubscribeTriggerAdded_ = owner.events.on(
      "trigger:added",
      ({ trigger }) => this.addTriggerBandView_(trigger),
    );
  }

  get width(): number {
    return this.dom_.viewportContainer.clientWidth;
  }

  get height(): number {
    return this.dom_.viewportContainer.clientHeight;
  }

  layout(transform: p4.LayoutTransform): void {
    this.dom_.layout(transform);
    for (const tbv of this.triggerBandViews_) tbv.layout(transform);
  }

  createSectionView(owner: p4.SectionViewOwner): p4.SectionView {
    const sv = new EditorSectionView(owner, this);
    this.sectionViews_.push(sv);
    return sv;
  }

  applyMode(mode: ViewMode): void {
    this.dom_.setMode(mode);
    const enabled = mode === "player";
    this.animationEnabled_ = enabled;
    for (const manager of this.animationManagers_) {
      manager.setEnabled(enabled);
    }
  }

  get animationEnabled(): boolean {
    return this.animationEnabled_;
  }

  registerAnimationManager(manager: EditorAnimationManager): void {
    this.animationManagers_.add(manager);
  }

  unregisterAnimationManager(manager: EditorAnimationManager): void {
    this.animationManagers_.delete(manager);
  }

  private addTriggerBandView_(trigger: p4.ScrollTrigger): void {
    const tbv = new EditorTriggerBandView(
      trigger,
      this.controller_,
      this.owner_.events,
      this.dom_.triggersContainer,
    );
    // Position immediately using the current transform so the band is never
    // momentarily at 0,0 before the next layout pass.
    tbv.layout(this.owner_.layoutTransform);
    this.triggerBandViews_.push(tbv);
  }

  // Called by EditorSectionView.destroy() on single-node removal so the dead
  // view is not included in future destroy() cascades.
  onSectionViewDestroyed(sv: EditorSectionView): void {
    const i = this.sectionViews_.indexOf(sv);
    if (i >= 0) this.sectionViews_.splice(i, 1);
  }

  destroy(): void {
    this.resizeObserver_.disconnect();
    this.dom_.viewportContainer.removeEventListener("scroll", this.onScroll_);
    this.dom_.viewportContainer.removeEventListener("keydown", this.onKeyDown_);
    this.dom_.viewportContainer.removeEventListener("keyup", this.onKeyUp_);

    this.unsubscribeTriggerAdded_();
    for (const tbv of this.triggerBandViews_) tbv.destroy();

    // Full-tree cascade. Spread so that each sv.destroy() can safely call
    // onSectionViewDestroyed() (mutating sectionViews_) without corrupting iteration.
    for (const sv of [...this.sectionViews_]) sv.destroy();

    this.dom_.destroy();
    this.controller_.unregisterView();
  }

  get pinsContainer(): HTMLElement {
    return this.dom_.pinsContainer;
  }

  get dom(): PresentationDOM {
    return this.dom_;
  }

  get owner(): p4.PresentationViewOwner {
    return this.owner_;
  }

  get controller(): EditorViewControllerImpl {
    return this.controller_;
  }
}
