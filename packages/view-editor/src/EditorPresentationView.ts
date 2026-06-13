import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { EditorSectionView } from "./EditorSectionView";
import { PresentationDOM } from "./dom/PresentationDOM";

export type EditorViewConfig = {
  /** The DOM element (or CSS selector) that the presentation renders into. */
  container: HTMLElement | string;
};

/**
 * Creates a PresentationViewFactory for the editor view.
 *
 * Usage:
 *   presentation.attachView(createEditorView({ container: "#app" }));
 */
export function createEditorView(
  config: EditorViewConfig,
): p4.PresentationViewFactory {
  return (owner: p4.PresentationViewOwner) =>
    new EditorPresentationView(owner, config);
}

export class EditorPresentationView implements p4.PresentationView {
  private readonly owner_: p4.PresentationViewOwner;
  private readonly dom_: PresentationDOM;
  private readonly resizeObserver_: ResizeObserver;

  constructor(owner: p4.PresentationViewOwner, config: EditorViewConfig) {
    this.owner_ = owner;
    this.dom_ = new PresentationDOM(this, config.container);

    this.resizeObserver_ = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = this.dom_.viewportContainer;
      this.owner_.notifyViewResized(clientWidth, clientHeight);
    });
    this.resizeObserver_.observe(this.dom_.containerElement);
  }

  get width(): number {
    return this.dom_.viewportContainer.clientWidth;
  }

  get height(): number {
    return this.dom_.viewportContainer.clientHeight;
  }

  layout(transform: p4.LayoutTransform): void {
    this.dom_.layout(transform);
  }

  createSectionView(owner: p4.SectionViewOwner): p4.SectionView {
    return new EditorSectionView(owner, this);
  }

  destroy(): void {
    this.resizeObserver_.disconnect();
    this.dom_.destroy();
  }

  get dom(): PresentationDOM {
    return this.dom_;
  }

  get owner(): p4.PresentationViewOwner {
    return this.owner_;
  }
}
