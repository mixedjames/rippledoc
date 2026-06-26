import type {
  MarkdownElement,
  Presentation,
  StyleRegistry,
} from "@rippledoc/presentation4";
import type { AnchorPickTarget } from "./AnchorPickTarget";
import type { DialogResult } from "./DialogResult";

export interface Dialogs {
  openGlobalStyles(styles: StyleRegistry): Promise<DialogResult<void>>;
  openNamedStyles(presentation: Presentation): Promise<void>;
  openMarkdownEditor(element: MarkdownElement): Promise<DialogResult<void>>;
  openAnchorPicker(
    presentation: Presentation,
  ): Promise<DialogResult<AnchorPickTarget>>;
}
