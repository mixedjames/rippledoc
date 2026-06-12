import { Layout } from "./Layout";
import { Presentation } from "./Presentation";

export interface LayoutPicker {
  pickLayout(presentation: Presentation): Layout;
}
