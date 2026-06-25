import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { Pin } from "../../clientAPI/animation/Pin";
import type { PinMemento } from "../../clientAPI/serialize/PresentationMemento";
import type { EventContext } from "../EventContext";

export class CorePin implements Pin {
  private trigger_: ScrollTrigger;
  private readonly eventContext_: EventContext;

  constructor(trigger: ScrollTrigger, eventContext: EventContext) {
    this.trigger_ = trigger;
    this.eventContext_ = eventContext;
  }

  get trigger(): ScrollTrigger {
    return this.trigger_;
  }

  setTrigger(trigger: ScrollTrigger): void {
    this.trigger_ = trigger;
    this.eventContext_.emit("pin:triggerChanged", { pin: this });
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
