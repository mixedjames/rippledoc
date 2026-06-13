import type { PresentationEvents } from "../clientAPI/PresentationEvents";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Section } from "../clientAPI/Section";
import type { Element } from "../clientAPI/Element";
import type { Anchor } from "../anchors/Anchor";
import type { XYAnchors } from "../anchors/XYAnchors";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { EventController } from "../common/EventController";

type AnchoredOwner = PresentationRoot | Section | Element;

/**
 * Thin helper owned by CorePresentation and threaded to every Core* object.
 *
 * Responsibilities:
 *   1. Delegate event emission to EventController (the only Core-layer path to emit).
 *   2. Maintain an anchor-to-owner registry so that when anchor expressions change,
 *      all transitively affected objects can be notified.
 */
export class EventContext {
  private readonly controller_: EventController<PresentationEvents>;
  private readonly ownerMap_ = new WeakMap<ConcreteAnchor, AnchoredOwner>();

  constructor(controller: EventController<PresentationEvents>) {
    this.controller_ = controller;
  }

  emit<K extends keyof PresentationEvents>(
    event: K,
    payload: PresentationEvents[K],
  ): void {
    this.controller_.emit(event, payload);
  }

  /**
   * Register all six anchors in `bag` as belonging to `owner`.
   * Call this once per bag: once in the object constructor for the initial bag,
   * and again in onBagCreated_ for each new layout bag.
   */
  registerAnchors(bag: XYAnchors, owner: AnchoredOwner): void {
    for (const anchor of [
      bag.left,
      bag.right,
      bag.width,
      bag.top,
      bag.bottom,
      bag.height,
    ]) {
      this.ownerMap_.set(anchor as ConcreteAnchor, owner);
    }
  }

  /**
   * Emit anchors:changed for `owner`, then BFS-walk the `changedAnchors`
   * dependents to find and notify all transitively affected objects.
   *
   * The anchor graph is a DAG (cycles are rejected at expression-set time),
   * so BFS terminates without cycle detection.
   */
  emitAnchorChanged(
    changedAnchors: readonly Anchor[],
    owner: AnchoredOwner,
  ): void {
    this.controller_.emit("anchors:changed", { target: owner });

    // Seed visited with changedAnchors so we don't re-enter them when they
    // appear as dependents of each other (e.g. the 2-of-3 derived anchor).
    const visited = new Set<ConcreteAnchor>();
    const queue: ConcreteAnchor[] = [];
    for (const anchor of changedAnchors) {
      const concrete = anchor as ConcreteAnchor;
      if (!visited.has(concrete)) {
        visited.add(concrete);
        queue.push(concrete);
      }
    }

    const emittedOwners = new Set<AnchoredOwner>([owner]);

    while (queue.length > 0) {
      const anchor = queue.shift()!;
      for (const dep of anchor.dependents) {
        const depConcrete = dep as ConcreteAnchor;
        if (visited.has(depConcrete)) continue;
        visited.add(depConcrete);

        const depOwner = this.ownerMap_.get(depConcrete);
        if (depOwner !== undefined && !emittedOwners.has(depOwner)) {
          emittedOwners.add(depOwner);
          this.controller_.emit("anchors:changed", { target: depOwner });
        }

        queue.push(depConcrete);
      }
    }
  }
}
