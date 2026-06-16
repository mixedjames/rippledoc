export interface EditOperation {
  execute(): void;
  undo(): void;
}
