import type { Presentation } from "../../clientAPI/Presentation";
import type { Section } from "../../clientAPI/Section";
import type { Element } from "../../clientAPI/Element";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { NamedElementStyle } from "../../clientAPI/styles/NamedElementStyle";
import type { NamedSectionStyle } from "../../clientAPI/styles/NamedSectionStyle";
import type { SectionAnimations } from "../../clientAPI/animation/SectionAnimations";
import type { KeyFrameAnimationOptions } from "../../clientAPI/animation/KeyFrameAnimation";
import type {
  PresentationMemento,
  SectionMemento,
  ElementMemento,
  KeyFrameAnimationMemento,
} from "../../clientAPI/serialize/PresentationMemento";
import type { AnchorRefResolver } from "./DeserializeContext";
import { CorePresentation } from "../CorePresentation";
import { constant } from "../../anchors/factories";
import {
  applyTriggerGeometry,
  applySectionGeometry,
  applyElementGeometry,
} from "./deserializeGeometry";

export function coreFromMemento(memento: PresentationMemento): Presentation {
  if (memento.version !== 1) {
    throw new Error(`Unsupported memento version: ${String(memento.version)}`);
  }

  const layout0 = memento.layouts[0];
  if (!layout0) throw new Error("Memento contains no layouts.");

  const p = new CorePresentation({
    basisWidth: layout0.basisWidth,
    basisHeight: layout0.basisHeight,
  });

  // ── Layouts ──────────────────────────────────────────────────────────────

  const layouts = [p.layout.defaultLayout];
  for (const lm of memento.layouts.slice(1)) {
    layouts.push(p.layout.addLayout(lm));
  }

  // ── Named styles ──────────────────────────────────────────────────────────

  const elementStyleMap = new Map<string, NamedElementStyle>();
  for (const sm of memento.elementStyles) {
    elementStyleMap.set(
      sm.name,
      p.styles.createElementStyle(sm.name, sm.props),
    );
  }
  const sectionStyleMap = new Map<string, NamedSectionStyle>();
  for (const sm of memento.sectionStyles) {
    sectionStyleMap.set(
      sm.name,
      p.styles.createSectionStyle(sm.name, sm.props),
    );
  }
  if (memento.globalElementStyle)
    p.styles.setGlobalElementStyle(memento.globalElementStyle);
  if (memento.globalSectionStyle)
    p.styles.setGlobalSectionStyle(memento.globalSectionStyle);

  // ── Triggers (placeholder geometry; replaced in the geometry pass) ────────
  // addScrollTrigger enforces the 2-of-3 rule in its constructor, so we supply
  // throwaway constants. The real expressions are applied per-layout below.

  const triggers: ScrollTrigger[] = [];
  for (const tm of memento.triggers) {
    triggers.push(
      p.addScrollTrigger({
        name: tm.name,
        top: constant(0),
        height: constant(0),
      }),
    );
  }

  // ── Sections and elements (structure + content + styles, no geometry yet) ─

  const sections: Section[] = [];
  const elementsBySection: Element[][] = [];

  for (const sm of memento.sections) {
    const section = p.root.addSection();
    section.setName(sm.name);
    if (sm.ownStyle) section.styles.set(sm.ownStyle);
    for (const name of sm.namedStyles) {
      section.styles.addNamed(sectionStyleMap.get(name)!);
    }
    sections.push(section);
    elementsBySection.push(buildElements(section, sm, elementStyleMap));
  }

  // ── Per-layout geometry pass ──────────────────────────────────────────────
  // Switch the active layout, build a resolver from the now-active anchor bags,
  // then apply geometry for every node in this layout.

  for (let li = 0; li < layouts.length; li++) {
    p.layout.setActiveLayout(layouts[li]!);
    const resolve = buildResolver(p, sections, elementsBySection, triggers);

    for (let ti = 0; ti < triggers.length; ti++) {
      applyTriggerGeometry(
        triggers[ti]!,
        memento.triggers[ti]!.layouts[li]!,
        resolve,
      );
    }
    for (let si = 0; si < sections.length; si++) {
      applySectionGeometry(
        sections[si]!,
        memento.sections[si]!.layouts[li]!,
        resolve,
      );
      const elements = elementsBySection[si]!;
      for (let ei = 0; ei < elements.length; ei++) {
        applyElementGeometry(
          elements[ei]!,
          memento.sections[si]!.elements[ei]!.layouts[li]!,
          resolve,
        );
      }
    }
  }

  // Restore the default layout as the active one.
  p.layout.setActiveLayout(layouts[0]!);

  // ── Animations ────────────────────────────────────────────────────────────

  for (let si = 0; si < sections.length; si++) {
    const sm = memento.sections[si]!;
    for (const am of sm.keyFrameAnimations) {
      applyKeyFrameAnimation(sections[si]!.animations, am, triggers);
    }
    const elements = elementsBySection[si]!;
    for (let ei = 0; ei < elements.length; ei++) {
      for (const am of sm.elements[ei]!.keyFrameAnimations) {
        applyKeyFrameAnimation(elements[ei]!.animations, am, triggers);
      }
      for (const pm of sm.elements[ei]!.pins) {
        elements[ei]!.animations.addPin(triggers[pm.triggerIndex]!);
      }
    }
  }

  return p;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildElements(
  section: Section,
  sm: SectionMemento,
  elementStyleMap: ReadonlyMap<string, NamedElementStyle>,
): Element[] {
  const elements: Element[] = [];
  for (const em of sm.elements) {
    // Create and rename sequentially so the next element's auto-name cannot
    // conflict with a name we've just assigned to a previous element.
    const element = createElement(section, em);
    element.setName(em.name);
    if (em.ownStyle) element.styles.set(em.ownStyle);
    for (const name of em.namedStyles) {
      element.styles.addNamed(elementStyleMap.get(name)!);
    }
    elements.push(element);
  }
  return elements;
}

function createElement(section: Section, em: ElementMemento): Element {
  if (em.type === "markdown") return section.addMarkdownElement(em.markdown);
  if (em.type === "bitmap") {
    const el = section.addBitmapImageElement();
    el.setSrc(em.src);
    el.setAlt(em.alt);
    if (em.objectFit) el.setObjectFit(em.objectFit);
    return el;
  }
  // svg
  const el = section.addSVGImageElement();
  el.setSrc(em.src);
  return el;
}

function applyKeyFrameAnimation(
  animations: SectionAnimations,
  memento: KeyFrameAnimationMemento,
  triggers: readonly ScrollTrigger[],
): void {
  const opts: KeyFrameAnimationOptions = {
    trigger: triggers[memento.triggerIndex]!,
    keyFrames: memento.keyFrames,
    duration: memento.duration,
    scrollDriven: memento.isScrollDriven,
    ...(memento.target !== undefined
      ? { target: { selector: memento.target } }
      : {}),
  };
  animations.addKeyFrameAnimation(opts);
}

// The resolver is rebuilt for each layout inside the geometry pass. Switching
// the active layout makes every object's .anchors getter return that layout's
// bag, so the closure transparently captures the right set of anchor objects.
function buildResolver(
  p: Presentation,
  sections: readonly Section[],
  elementsBySection: readonly (readonly Element[])[],
  triggers: readonly ScrollTrigger[],
): AnchorRefResolver {
  return (ref) => {
    if (ref.node === "root") {
      const root = p.root;
      if (ref.slot === "viewportWidth") return root.viewportWidth;
      if (ref.slot === "viewportHeight") return root.viewportHeight;
      if (ref.slot === "viewportLeft") return root.viewportLeft;
      if (ref.slot === "viewportRight") return root.viewportRight;
      return root.anchors[ref.slot];
    }
    if (ref.node === "section") return sections[ref.index]!.anchors[ref.slot];
    if (ref.node === "element") {
      return elementsBySection[ref.sectionIndex]![ref.elementIndex]!.anchors[
        ref.slot
      ];
    }
    // trigger
    return triggers[ref.index]!.anchors[ref.slot];
  };
}
