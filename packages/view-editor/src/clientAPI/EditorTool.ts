import type { EditorViewEvents } from "./EditorViewEvents";

/**
 * A caller-supplied object that receives interactive events while it is the
 * active tool on the controller. All methods are optional — implement only
 * the events the tool cares about.
 *
 * Only one tool is active at a time. Swapping tools via setActiveTool() is
 * the sole lifecycle mechanism; no subscribe/unsubscribe is needed.
 *
 * Global EditorViewEventSource subscribers receive events regardless of which
 * tool is active — tools are an additive layer, not a replacement.
 */
export interface EditorTool {
  onElementPicked?(payload: EditorViewEvents["element:picked"]): void;
  onElementPointerDown?(payload: EditorViewEvents["element:pointerDown"]): void;
  onElementPointerUp?(payload: EditorViewEvents["element:pointerUp"]): void;
  onSectionPicked?(payload: EditorViewEvents["section:picked"]): void;
  onSectionPointerDown?(payload: EditorViewEvents["section:pointerDown"]): void;
  onSectionPointerUp?(payload: EditorViewEvents["section:pointerUp"]): void;
  onKeyDown?(payload: EditorViewEvents["key:down"]): void;
  onKeyUp?(payload: EditorViewEvents["key:up"]): void;
}

/**
 * No-op tool installed by default. Pass to setActiveTool() to deactivate any
 * real tool without introducing null into the interface.
 */
export const NullTool: EditorTool = Object.freeze({});
