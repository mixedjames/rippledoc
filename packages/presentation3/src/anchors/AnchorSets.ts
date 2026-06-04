import type { AnchorExpression } from "./expressions/AnchorExpression";

export interface HorizontalAnchors {
  left?: AnchorExpression;
  right?: AnchorExpression;
  width?: AnchorExpression;
}

export interface VerticalAnchors {
  top?: AnchorExpression;
  bottom?: AnchorExpression;
  height?: AnchorExpression;
}
