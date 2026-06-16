import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { Pin } from "../../clientAPI/animation/Pin";
import type { PinMemento } from "../../clientAPI/serialize/PresentationMemento";

export class CorePin implements Pin {
  private readonly trigger_: ScrollTrigger;

  constructor(trigger: ScrollTrigger) {
    this.trigger_ = trigger;
  }

  get trigger(): ScrollTrigger {
    return this.trigger_;
  }

  toMemento(triggerIndex: ReadonlyMap<ScrollTrigger, number>): PinMemento {
    const idx = triggerIndex.get(this.trigger_);
    if (idx === undefined) {
      throw new Error(
        "CorePin.toMemento: trigger not registered in this presentation.",
      );
    }
    return { triggerIndex: idx };
  }
}
