import * as Anchors from "../../anchors/index";

type Axis = "horizontal" | "vertical";

/**
 * ConcreteAnchoredObjectBase provides:
 * - A concrete base implementation of the Anchors.AnchoredObject that is then used by various DOM
 *   classes
 * - Common methods for setting those anchors in a coherent way that prevents both over and
 *   under-constraining the object
 * - An "id" property
 *
 * It is abstract and exists only as a utility class. Code should not depend on it and it may
 * disappear or be replaced without warning.
 *
 * Generic consumers should depend only on the Anchors.AnchoredObject interface instead.
 */
export abstract class ConcreteAnchoredObjectBase
  implements Anchors.AnchoredObject
{
  // IMPLEMENTATION NOTE:
  // These are public but readonly - this is intentional rather than using getters which would be
  // superflouos here.

  readonly leftAnchor: Anchors.Anchor;
  readonly rightAnchor: Anchors.Anchor;
  readonly widthAnchor: Anchors.Anchor;

  readonly topAnchor: Anchors.Anchor;
  readonly bottomAnchor: Anchors.Anchor;
  readonly heightAnchor: Anchors.Anchor;

  private readonly id_: string;

  protected constructor(id: string) {
    this.id_ = id;

    this.leftAnchor = new Anchors.Anchor(this);
    this.rightAnchor = new Anchors.Anchor(this);
    this.widthAnchor = new Anchors.Anchor(this);

    this.topAnchor = new Anchors.Anchor(this);
    this.bottomAnchor = new Anchors.Anchor(this);
    this.heightAnchor = new Anchors.Anchor(this);
  }

  get left(): number {
    return this.leftAnchor.value;
  }

  get right(): number {
    return this.rightAnchor.value;
  }

  get width(): number {
    return this.widthAnchor.value;
  }

  get top(): number {
    return this.topAnchor.value;
  }

  get bottom(): number {
    return this.bottomAnchor.value;
  }

  get height(): number {
    return this.heightAnchor.value;
  }

  setHorizontalAnchors(descriptor: Anchors.HorizontalAnchors): void {
    this.applyAxis("horizontal", {
      startExpression: descriptor.left,
      endExpression: descriptor.right,
      sizeExpression: descriptor.width,
    });
  }

  setVerticalAnchors(descriptor: Anchors.VerticalAnchors): void {
    this.applyAxis("vertical", {
      startExpression: descriptor.top,
      endExpression: descriptor.bottom,
      sizeExpression: descriptor.height,
    });
  }

  private applyAxis(
    axis: Axis,
    expressions: {
      startExpression: Anchors.AnchorExpression | undefined;
      endExpression: Anchors.AnchorExpression | undefined;
      sizeExpression: Anchors.AnchorExpression | undefined;
    },
  ): void {
    const { startExpression, endExpression, sizeExpression } = expressions;

    if (countDefined([startExpression, endExpression, sizeExpression]) !== 2) {
      throw new Anchors.GeometryConstraintError(
        `Axis update for ${this.id_}.${axis} must provide exactly two constraints.`,
      );
    }

    const [startAnchor, endAnchor, sizeAnchor] =
      axis === "horizontal"
        ? [this.leftAnchor, this.rightAnchor, this.widthAnchor]
        : [this.topAnchor, this.bottomAnchor, this.heightAnchor];

    let resolvedStart = startExpression;
    let resolvedEnd = endExpression;
    let resolvedSize = sizeExpression;

    if (resolvedStart !== undefined && resolvedEnd !== undefined) {
      resolvedSize = new Anchors.DerivedAnchorExpression(
        [startAnchor, endAnchor],
        () => endAnchor.value - startAnchor.value,
        `${axis}.size=end-start`,
      );
    } else if (resolvedStart !== undefined && resolvedSize !== undefined) {
      resolvedEnd = new Anchors.DerivedAnchorExpression(
        [startAnchor, sizeAnchor],
        () => startAnchor.value + sizeAnchor.value,
        `${axis}.end=start+size`,
      );
    } else if (resolvedEnd !== undefined && resolvedSize !== undefined) {
      resolvedStart = new Anchors.DerivedAnchorExpression(
        [endAnchor, sizeAnchor],
        () => endAnchor.value - sizeAnchor.value,
        `${axis}.start=end-size`,
      );
    }

    Anchors.Anchor.applyExpressions(
      new Map([
        [startAnchor, resolvedStart!],
        [endAnchor, resolvedEnd!],
        [sizeAnchor, resolvedSize!],
      ]),
    );
  }
}

function countDefined(
  values: Array<Anchors.AnchorExpression | undefined>,
): number {
  return values.filter((value) => value !== undefined).length;
}
