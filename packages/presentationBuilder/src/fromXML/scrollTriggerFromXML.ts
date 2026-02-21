export type ScrollTriggerBuilderFactory = {
  createScrollTrigger(): {
    setStart(expr: string): void;
    setEnd(expr: string): void;
    setStartViewOffset(offset: number): void;
    setEndViewOffset(offset: number): void;
  };
};

export function loadScrollTrigger(
  triggerEl: Element,
  factory: ScrollTriggerBuilderFactory,
): void {
  const builder = factory.createScrollTrigger();

  const start = triggerEl.getAttribute("start");
  const end = triggerEl.getAttribute("end");

  if (!start || !start.trim()) {
    throw new Error("<scroll-trigger> element must have a 'start' attribute");
  }

  if (!end || !end.trim()) {
    throw new Error("<scroll-trigger> element must have an 'end' attribute");
  }

  builder.setStart(start);
  builder.setEnd(end);

  const startHits = triggerEl.getAttribute("start-hits");
  const endHits = triggerEl.getAttribute("end-hits");

  if (startHits && startHits.trim() !== "") {
    builder.setStartViewOffset(parseViewportHitPosition(startHits));
  }

  if (endHits && endHits.trim() !== "") {
    builder.setEndViewOffset(parseViewportHitPosition(endHits));
  }
}

export function parseViewportHitPosition(value: string): number {
  const v = value.trim().toLowerCase();

  if (v === "top") return 0;
  if (v === "middle") return 0.5; // eslint-disable-line no-magic-numbers
  if (v === "bottom") return 1;

  if (v.endsWith("%")) {
    // -1 is not magic here - negative numbers count back from end of array so this simply
    // removes the last occurrence of '%'.
    // eslint-disable-next-line no-magic-numbers
    const num = Number(v.slice(0, -1));
    if (!Number.isFinite(num)) {
      throw new Error(
        `Invalid viewport hit position "${value}". Expected 'top', 'middle', 'bottom' or a percentage like '50%'.`,
      );
    }

    // Not magic: converts fraction from percentage
    // eslint-disable-next-line no-magic-numbers
    const fraction = num / 100;
    if (fraction < 0 || fraction > 1) {
      throw new Error(
        `Viewport hit percentage out of range in "${value}". Expected 0%–100%.`,
      );
    }
    return fraction;
  }

  throw new Error(
    `Invalid viewport hit position "${value}". Expected 'top', 'middle', 'bottom' or a percentage like '50%'.`,
  );
}
