import type { Presentation, StyleRegistry } from "@rippledoc/presentation4";
import type { Dialogs } from "../clientAPI/Dialogs";
import type { DialogResult } from "../clientAPI/DialogResult";
import type { OperationSink } from "../clientAPI/OperationSink";
import { DialogHost } from "./infrastructure/DialogHost";
import { injectDialogStyles } from "./infrastructure/DialogStyles";
import { openGlobalStylesDialog } from "./dialogs/GlobalStylesDialog";
import { openNamedStylesDialog } from "./dialogs/NamedStylesDialog";

export class DialogsImpl implements Dialogs {
  private readonly host_: DialogHost;
  private readonly sink_: OperationSink;

  constructor(mountPoint: HTMLElement, sink: OperationSink) {
    this.sink_ = sink;
    injectDialogStyles();
    this.host_ = new DialogHost(mountPoint);
  }

  openGlobalStyles(styles: StyleRegistry): Promise<DialogResult<void>> {
    return openGlobalStylesDialog(this.host_, styles, this.sink_);
  }

  openNamedStyles(presentation: Presentation): Promise<void> {
    return openNamedStylesDialog(this.host_, presentation, this.sink_);
  }
}
