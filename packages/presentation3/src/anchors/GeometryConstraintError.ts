export class GeometryConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeometryConstraintError";
  }
}
