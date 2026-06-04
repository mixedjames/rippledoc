# Example useage of @rippledoc/presentation3/geometry

```{ts}
const p = new Presentation();

/* Adds a new section to the end of the presentation.
   This will have default constraints as follows:
    - Horizontal: these are always fixed for sections - left=0, right=slideWidth, width=derived
    - Vertical: top=previousSlide.bottom, height=slideHeight, bottom=derived

   ... i.e. a full-height section.
    */
const s1 = p.addSection();

/* Adds an element to s1. In reality we'll have separate methods for all the element types
   we support (presentations are not extensible by clients)

   It will have default constrains: (% values are calculated constants, not expressions)
   - Horizontal: left = 5% of slideWidth, width = 30% of slideWidth, right = derived
   - Vertical: top = ownerSection.top + 5% of slideWidth, height = 0.25*ownerSection.height,
     bottom = derived
   */
const e1 = s1.addElement();

/* Now we setup an example where e1 is anchored to the left and right of the slide and width
   flexes */
s1.setHorizontalAnchors({
  left: offsetFrom(s1.leftAnchor, 10),
  right: offsetFrom(s1.rightAnchor, -10)
  /* width not specified so implicitly derived */
});

const e2 = s1.addElement();
e2.setVerticalAnchors({
  top: offsetFrom(e1.bottomAnchor, 10),
  bottom: offsetFrom(s1.bottomAnchor, -10)
  /* height not specified so implitly derived */
});

e2.setHorizontalAnchors({
  left: hCenter(s1),
  width: fractionOf(s1.widthAnchor, 0.5)
});

```

Some examples of how the various components _might_ be defined:

```{TypeScript}

interface AnchorExpressionVisitor {
  /* Callback for each concrete expression type we provide */
  visitConstantExpression(e: ConstantAnchorExpression): void;
}

interface AnchorExpression {

  evaluate(owner: Anchor): number;

  get dependencies(): Anchor[];

  visit(visitor: AnchorExpressionVisitor): void;

}

class Anchor {
  get value(): number;

  /* What Anchors do we depend on? Important for checking for circular dependencies. */
  get dependencies(): Anchor[];

  /* What Anchors do we depend on us? Important for updating dependency graph when things change */
  get dependents(): Anchor[];
}

interface AnchoredObject {
  /* Direct accessors for clients who don't care about anchors (i.e. most renderers/layout code) */
  get left(): number;
  get right(): number;
  get width(): number;
  get top(): number;
  get bottom(): number;
  get height(): number;

  /* Accessors mainly for anchor expressions - user code very unlikely to need these
     Key ideas: anchors have identity semantics; that is, every call to leftAnchor returns the
     same Anchor object ever time. This is crucial so that we can maintain a dependency graph
     if the face of changing anchors
  */
  get leftAnchor(): number;
  get rightAnchor(): number;
  get widthAnchor(): number;
  get topAnchor(): number;
  get bottomAnchor(): number;
  get heightAnchor(): number;

}

type VerticalAnchors {
  top?: AnchorExpression;
  bottom?: AnchorExpression;
  height?: AnchorExpression;
}

class Presentation implements AnchoredObject {
  addSection(): PSection;
}

class PSection implements AnchoredObject {
  addElement(): PElement;

  setVerticalAnchors(anchorDesc: VerticalAnchors): void;
  setHorizontalAnchors(anchorDesc: HorizontalAnchors): void;
}

class PElement implements AnchoredObject {
  setVerticalAnchors(anchorDesc: VerticalAnchors): void;
  setHorizontalAnchors(anchorDesc: HorizontalAnchors): void;
}

```
