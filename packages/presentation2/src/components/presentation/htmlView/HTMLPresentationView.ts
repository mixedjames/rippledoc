import { PhysicalDimensions, Presentation } from "../Presentation";
import { ConnectionData } from "../PresentationView";
import { HTMLPresentationViewRoot } from "./HTMLPresentationViewRoot";

/**
 * This is the client-facing API for the HTMLPresentationView component.
 *
 * In general, if a method on this exists, you can use it. If it doesn't, you can't. Please don't
 * go furtling around in the htmlView hierarchy. Nothing in there is contractual and you will break
 * things if you mess with it.
 *
 *
 */
export class HTMLPresentationView {
  /**
   * We use the 'pImpl' pattern to hide the implementation details of the HTMLPresentationView.
   * This is a common pattern in C++ and other languages, but it's not as common in TypeScript.
   * However, it helps us keep the public API clean and stable while allowing us to change the
   * implementation.
   *
   * Any state or proper functionality should live in the proper view hierarchy, and not here.
   */
  private pImpl_: HTMLPresentationViewRoot | null = null;

  constructor(options: {
    presentation: Presentation;
    container: HTMLElement | string;
  }) {
    // We use the self=this pattern to get around a TypeScript issue with getters created as part
    // of an object literal. See get physicalDimensions below.
    //
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    options.presentation.attachView({
      connect: (connectionData: ConnectionData) => {
        if (this.pImpl_) {
          throw new Error("Already connected");
        }

        this.pImpl_ = new HTMLPresentationViewRoot({
          presentation: options.presentation,
          container: options.container,
          sortedContentDependentElements:
            connectionData.sortedContentDependentElements,
        });

        // We can trigger a first layout here because we know that, after HTMLPresentationViewRoot
        // has constructed, the DOM is valid.
        this.pImpl_.layout();
      }, // connect

      disconnect: () => {
        if (!this.pImpl_) {
          throw new Error("Not connected");
        }

        this.pImpl_.disconnect();
        this.pImpl_ = null;
      }, // disconnect

      get physicalDimensions(): PhysicalDimensions {
        if (!self.pImpl_) {
          throw new Error("Not connected");
        }

        return self.pImpl_.physicalDimensions;
      },
    }); // end attachView
  }
}
