import type {
  Presentation,
  PresentationOptions,
  PresentationMemento,
} from "@rippledoc/presentation4";
import type { EditorCommandId } from "./EditorCommands";
import type { EditorEventSource } from "./EditorEvents";

export interface EditorComponent {
  /** The root DOM element to mount in the shell's layout. */
  readonly element: HTMLElement;

  /** Replace the current presentation with a fresh empty one and return it for seeding. */
  newPresentation(options?: PresentationOptions): Presentation;

  /** Restore a presentation from a previously saved memento. */
  loadPresentation(memento: PresentationMemento): void;

  /** Serialize the current presentation to a JSON-safe memento. */
  getMemento(): PresentationMemento;

  /** Execute a named command. No-ops if canExec returns false. */
  exec(command: EditorCommandId): void;

  /** Query whether a command is currently available. */
  canExec(command: EditorCommandId): boolean;

  readonly events: EditorEventSource;
}
