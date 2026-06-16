import type { EditorComponent } from "./clientAPI/EditorComponent";
import type { EditorDelegate } from "./clientAPI/EditorDelegate";
import { EditorComponentImpl } from "./core/EditorComponentImpl";

export function createEditorComponent(
  delegate: EditorDelegate,
): EditorComponent {
  return new EditorComponentImpl(delegate);
}
