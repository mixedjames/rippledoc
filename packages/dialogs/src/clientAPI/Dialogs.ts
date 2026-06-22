import type { StyleRegistry } from "@rippledoc/presentation4";
import type { DialogResult } from "./DialogResult";

export interface Dialogs {
  openGlobalStyles(styles: StyleRegistry): Promise<DialogResult<void>>;
}
