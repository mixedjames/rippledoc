import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorViewControllerImpl } from "../EditorViewControllerImpl";

/**
 * Manages the DOM for a single trigger band in the editor.
 *
 * The band is a full-width div positioned in the triggers layer at the
 * trigger's resolved vertical range. It is visible in editor mode only
 * (controlled by CSS reacting to the viewport's data-mode attribute).
 *
 * Picking: pointerdown emits "trigger:picked" through the controller.
 * Selection chrome: the "selected" class is toggled in response to
 * "selection:changed", mirroring the pattern used by EditorElementView.
 */
export class EditorTriggerBandView {
  private readonly trigger_: p4.ScrollTrigger;
  private readonly band_: HTMLElement = document.createElement("div");
  private readonly label_: HTMLElement = document.createElement("div");
  private readonly unsubscribeSelection_: () => void;
  private readonly unsubscribeNameChanged_: () => void;
  private readonly onPointerDown_: (e: PointerEvent) => void;

  constructor(
    trigger: p4.ScrollTrigger,
    controller: EditorViewControllerImpl,
    presentationEvents: p4.PresentationEventSource,
    container: HTMLElement,
  ) {
    this.trigger_ = trigger;

    this.label_.className = "trigger-band-label";
    this.label_.textContent = trigger.name;

    this.band_.className = "trigger-band";
    this.band_.style.pointerEvents = "auto";
    this.band_.appendChild(this.label_);
    container.appendChild(this.band_);

    this.onPointerDown_ = (e: PointerEvent) => {
      controller.emit("trigger:picked", { trigger, source: e });
    };
    this.band_.addEventListener("pointerdown", this.onPointerDown_);

    this.unsubscribeSelection_ = controller.events.on(
      "selection:changed",
      ({ triggers }) => {
        this.band_.classList.toggle("selected", triggers.has(trigger));
      },
    );

    this.unsubscribeNameChanged_ = presentationEvents.on(
      "trigger:nameChanged",
      ({ trigger: t, name }) => {
        if (t === trigger) this.label_.textContent = name;
      },
    );

    // Initialise selection chrome without waiting for the next event.
    this.band_.classList.toggle(
      "selected",
      controller.selection.hasTrigger(trigger),
    );
  }

  layout(transform: p4.LayoutTransform): void {
    const { scale } = transform;
    this.band_.style.top = `${this.trigger_.top * scale}px`;
    this.band_.style.height = `${this.trigger_.height * scale}px`;
  }

  destroy(): void {
    this.unsubscribeSelection_();
    this.unsubscribeNameChanged_();
    this.band_.removeEventListener("pointerdown", this.onPointerDown_);
    this.band_.remove();
  }
}
