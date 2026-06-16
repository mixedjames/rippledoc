import * as p3 from "../../document/viewModule";
import { V1SectionView } from "../section/V1SectionView";
import { PresentationDOM } from "./PresentationDOM";

type V1PresentationViewConfig = {
  container: HTMLElement | string;
};

export function createV1PresentationView(
  config: V1PresentationViewConfig,
): (owner: p3.PresentationViewOwner) => p3.PresentationView {
  return (owner: p3.PresentationViewOwner) =>
    new V1PresentationView(owner, config);
}

export class V1PresentationView implements p3.PresentationView {
  private owner_: p3.PresentationViewOwner;
  private dom_: PresentationDOM;

  private resizeObserver_: ResizeObserver;

  constructor(
    owner: p3.PresentationViewOwner,
    config: V1PresentationViewConfig,
  ) {
    this.owner_ = owner;
    this.dom_ = new PresentationDOM(this, config.container);

    this.resizeObserver_ = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = this.dom_.viewportContainer;
      this.owner_.layout(clientWidth, clientHeight);
    });
    this.resizeObserver_.observe(this.dom_.containerElement);
  }

  destroy(): void {}

  createSectionView(owner: p3.SectionViewOwner): p3.SectionView {
    return new V1SectionView(owner, this);
  }

  get htmlDOM(): PresentationDOM {
    return this.dom_;
  }

  get width(): number {
    return this.dom_.containerElement.clientWidth;
  }

  get height(): number {
    return this.dom_.containerElement.clientHeight;
  }

  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.dom_.layout({ scale, tx });
  }

  get owner(): p3.PresentationViewOwner {
    return this.owner_;
  }
}
