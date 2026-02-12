# HTML structure

This document is a quick note to explain to humans and co-pilot what the output of the
HTMLPresentationView looks like.

## Key idea

Presentations are laid out in global coordinates, not local ones. That means that, although an
element has a parent section, and will likely use the bounds of that section for layout, the
actual coordinates are relative to the global root element.

We also need to support sections as providers of background elements - i.e. images/colours/fills
etc. defined on sections need to be behind any elements, including elements on other sections.
This is key because we support elements that span multiple sections by design.

## Technical details

```html
<div id="root-element" style="position: relative;">
  <div class="backgrounds">
    <div
      class="section-name-background"
      style="...calculated positioning..."
    ></div>
  </div>

  <div class="elements">
    <section
      class="section-name-content"
      style="position: absolute; left: 0; top: 0;"
    >
      <div class="element-name-content" style="...calculated positioning...">
        <!-- Section content goes here -->
      </div>
    </section>
  </div>
</div>
```

**Note:** unnamed sections and elements have a generated name using their position within the
parent.

**Note:** the choices of positioning are deliberate:

- `#root-element` must be positioned so that absolutely positioned children are positioned relative
  to it.
- Children of `.background` stack and have the correct height as per calculations
- `.elements section` are all positioned to the top left corner so that positioning of child
  elements is correct.
