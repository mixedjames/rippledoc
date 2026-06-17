import type { Element, Section } from "@rippledoc/presentation4";
import type { EditorToolId } from "./EditorCommands";

export type EditorEvents = {
  toolChanged: { tool: EditorToolId };
  selectionChanged: {
    elements: ReadonlySet<Element>;
    sections: ReadonlySet<Section>;
  };
  dirty: { isDirty: boolean };
  /** Fired when command availability may have changed; shell should re-query canExec. */
  commandStateChanged: Record<never, never>;
};

export interface EditorEventSource {
  on<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void,
  ): () => void;
}
