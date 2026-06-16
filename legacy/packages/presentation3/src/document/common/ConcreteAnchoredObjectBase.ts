import * as Anchors from "../../anchors/index";
import { Layout } from "../presentation/Layout";

type Axis = "horizontal" | "vertical";

type AnchorSet = {
  leftAnchor: Anchors.Anchor;
  rightAnchor: Anchors.Anchor;
  widthAnchor: Anchors.Anchor;
  topAnchor: Anchors.Anchor;
  bottomAnchor: Anchors.Anchor;
  heightAnchor: Anchors.Anchor;
};

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
  implements Anchors.XYAnchoredObject, Anchors.AnchorOwner
{
  private leftAnchor_: Anchors.Anchor;
  private rightAnchor_: Anchors.Anchor;
  private widthAnchor_: Anchors.Anchor;

  private topAnchor_: Anchors.Anchor;
  private bottomAnchor_: Anchors.Anchor;
  private heightAnchor_: Anchors.Anchor;

  private readonly id_: string;

  private currentLayout_: Layout | null = null;

  private readonly anchorSets_: Map<Layout, AnchorSet> = new Map();

  protected constructor(id: string) {
    this.id_ = id;

    this.leftAnchor_ = new Anchors.Anchor(this);
    this.rightAnchor_ = new Anchors.Anchor(this);
    this.widthAnchor_ = new Anchors.Anchor(this);

    this.topAnchor_ = new Anchors.Anchor(this);
    this.bottomAnchor_ = new Anchors.Anchor(this);
    this.heightAnchor_ = new Anchors.Anchor(this);
  }

  /**
   * Supplies the default layout for this anchored object.
   *
   * Must be called before any other layouts are applied.
   */
  protected supplyDefaultLayout(layout: Layout): void {
    if (this.anchorSets_.size > 0) {
      throw new Error(
        "Default layout must be supplied before any layouts are applied.",
      );
    }

    this.anchorSets_.set(layout, {
      leftAnchor: this.leftAnchor_,
      rightAnchor: this.rightAnchor_,
      widthAnchor: this.widthAnchor_,
      topAnchor: this.topAnchor_,
      bottomAnchor: this.bottomAnchor_,
      heightAnchor: this.heightAnchor_,
    });
  }

  anchorChanged(): void {
    // Default implementation does nothing; subclasses may override if they need to react to changes.
  }

  get left(): number {
    return this.leftAnchor_.value;
  }

  get right(): number {
    return this.rightAnchor_.value;
  }

  get width(): number {
    return this.widthAnchor_.value;
  }

  get top(): number {
    return this.topAnchor_.value;
  }

  get bottom(): number {
    return this.bottomAnchor_.value;
  }

  get height(): number {
    return this.heightAnchor_.value;
  }

  get leftAnchor(): Anchors.Anchor {
    return this.leftAnchor_;
  }

  get rightAnchor(): Anchors.Anchor {
    return this.rightAnchor_;
  }

  get widthAnchor(): Anchors.Anchor {
    return this.widthAnchor_;
  }

  get topAnchor(): Anchors.Anchor {
    return this.topAnchor_;
  }

  get bottomAnchor(): Anchors.Anchor {
    return this.bottomAnchor_;
  }

  get heightAnchor(): Anchors.Anchor {
    return this.heightAnchor_;
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
        ? [this.leftAnchor_, this.rightAnchor_, this.widthAnchor_]
        : [this.topAnchor_, this.bottomAnchor_, this.heightAnchor_];

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

  /**
   * Subclasses may wish to override this to perform additional work when the layout changes,
   * for example notifying child objects, but they must call super.setActiveLayout() first.
   */
  setActiveLayout(layout: Layout): void {
    const anchorSet = this.anchorSets_.get(layout);
    if (!anchorSet) {
      throw new Error(`Layout is not registered for object ${this.id_}.`);
    }

    this.leftAnchor_ = anchorSet.leftAnchor;
    this.rightAnchor_ = anchorSet.rightAnchor;
    this.widthAnchor_ = anchorSet.widthAnchor;
    this.topAnchor_ = anchorSet.topAnchor;
    this.bottomAnchor_ = anchorSet.bottomAnchor;
    this.heightAnchor_ = anchorSet.heightAnchor;
  }

  layoutAdded(layout: Layout, copyFrom: Layout): void {
    const sourceSet = this.anchorSets_.get(copyFrom);
    if (!sourceSet) {
      throw new Error(
        `Source layout is not registered for object ${this.id_}.`,
      );
    }

    this.anchorSets_.set(layout, {
      leftAnchor: sourceSet.leftAnchor.clone(),
      rightAnchor: sourceSet.rightAnchor.clone(),
      widthAnchor: sourceSet.widthAnchor.clone(),
      topAnchor: sourceSet.topAnchor.clone(),
      bottomAnchor: sourceSet.bottomAnchor.clone(),
      heightAnchor: sourceSet.heightAnchor.clone(),
    });
  }
}

function countDefined(
  values: Array<Anchors.AnchorExpression | undefined>,
): number {
  return values.filter((value) => value !== undefined).length;
}
