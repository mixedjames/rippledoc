import type { Section } from "../../clientAPI/Section";
import type { Element } from "../../clientAPI/Element";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type {
  TriggerLayoutGeometryMemento,
  SectionLayoutGeometryMemento,
  ElementLayoutGeometryMemento,
  VerticalAnchorsMemento,
  HorizontalAnchorsMemento,
} from "../../clientAPI/serialize/PresentationMemento";
import type { AnchorExpression } from "../../anchors/Anchor";
import type { AnchorRefResolver } from "./DeserializeContext";
import { resolveExpr } from "./deserializeExpression";

export function applyTriggerGeometry(
  trigger: ScrollTrigger,
  memento: TriggerLayoutGeometryMemento,
  resolve: AnchorRefResolver,
): void {
  const v = resolveVertical(memento.vertical, resolve);
  if (v) trigger.setVerticalAnchors(v);
}

export function applySectionGeometry(
  section: Section,
  memento: SectionLayoutGeometryMemento,
  resolve: AnchorRefResolver,
): void {
  const v = resolveVertical(memento.vertical, resolve);
  if (v) section.setVerticalAnchors(v);
}

export function applyElementGeometry(
  element: Element,
  memento: ElementLayoutGeometryMemento,
  resolve: AnchorRefResolver,
): void {
  const h = memento.horizontal;
  const v = memento.vertical;

  if (h.mode === "contentWidth") {
    const expr = resolveExpr(h.fixed.expr, resolve);
    element.setAutoWidth(
      h.fixed.fixedEdge === "left" ? { left: expr } : { right: expr },
    );
  } else {
    const anchors = resolveHorizontal(h.anchors, resolve);
    if (anchors) element.setHorizontalAnchors(anchors);
  }

  if (v.mode === "contentHeight") {
    const expr = resolveExpr(v.fixed.expr, resolve);
    element.setAutoHeight(
      v.fixed.fixedEdge === "top" ? { top: expr } : { bottom: expr },
    );
  } else {
    const anchors = resolveVertical(v.anchors, resolve);
    if (anchors) element.setVerticalAnchors(anchors);
  }
}

type VerticalSet = {
  top?: AnchorExpression;
  bottom?: AnchorExpression;
  height?: AnchorExpression;
};

type HorizontalSet = {
  left?: AnchorExpression;
  right?: AnchorExpression;
  width?: AnchorExpression;
};

function resolveVertical(
  m: VerticalAnchorsMemento,
  resolve: AnchorRefResolver,
): VerticalSet | null {
  const top = m.top ? resolveExpr(m.top, resolve) : undefined;
  const bottom = m.bottom ? resolveExpr(m.bottom, resolve) : undefined;
  const height = m.height ? resolveExpr(m.height, resolve) : undefined;
  if (!top && !bottom && !height) return null;
  return { top, bottom, height };
}

function resolveHorizontal(
  m: HorizontalAnchorsMemento,
  resolve: AnchorRefResolver,
): HorizontalSet | null {
  const left = m.left ? resolveExpr(m.left, resolve) : undefined;
  const right = m.right ? resolveExpr(m.right, resolve) : undefined;
  const width = m.width ? resolveExpr(m.width, resolve) : undefined;
  if (!left && !right && !width) return null;
  return { left, right, width };
}
