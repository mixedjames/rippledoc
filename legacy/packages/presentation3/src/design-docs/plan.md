# Plan for @rippledoc/presentation3/geometry

This package describes the basic geometry ideas and structures that define how a
@rippledoc/presentation3 is laid out.

## Core Concept

> Sections 1 and 2 are for exposition but they do not represent a formal spec. which will be provided
> elsewhere. Sections 3 and beyond are normative however.

### (1) What is Rippledoc?

Rippledoc is a tool for producing educational presentations with integral scrolly-telling elements.

Many tools offer this - what makes Rippledoc unique is:

- Being Free Open Source Software: _free in the sense of free beer and free speech_
- Author retains absolute ownership of the content (it exists as a simple HTML file and is not
  tied to proprietary storage)
- Presentations are (or can be) self contained: _possible to export as a single HTML file which
  contains not only the presentation but the code and resources to present it correctly_

### (2) The Presentation Model

Rippledoc presentations are experienced by vertically scrolling through the content. Conceptually
it has a limitless vertical canvas, constrained horizontally to the width of the device.

Presentation elements (text, images etc.) are positioned on that canvas.

Logically the content is divided into sections. Visually sections behaves as vertically stacked
rectangular areas and indeed the overall height of the canvas is determined by the summed height of
the sections. It is worth noting here that, although elements have a section as a logical parent,
elements can appear anywhere and are not limited to the boundaries of that section.

Animations are all scroll-triggered and are all reversible; I use the word 'triggered' here to mean started or stopped. Animations may be time or scroll driven - the former, once triggered, proceed by the clock, independent of further scrolling; whereas the latter proceed as the user scrolls.

### (3) The Layout Model

#### (3a) Coordinate Spaces

There are two coordinate spaces:
(1) Physical Coordinates - these are the native coordinates of the display surface itself (the CSS
coordinates in the default implementation); these are defined by the environment
(2) Presentation Coordinates - this is a logical coordinate system defined by the presentation
itself (not RippleDoc) and specified as a virtual viewport rectangle. All positions specified
in the presentation are in presentation coordinates.

Conversion between the two is as follows:

- One is simply an isotropic scale of the other
- The scale factor is determined by the largest virtual viewport rectangle that fits within the
  device viewport without overlap

#### (3b) Anchors

Elements, sections, and the global presentation are all rectangles specified by a pair of axes:

- Horizontal: exactly 2 of left, right and width
- Vertical: exactly 2 of top, bottom and height

Each value is specified by an **anchor**: an anchor is an object that calculates and provides a
value in presentation coordinates.

Anchors come in a variety of forms:

- An editable constant (_e.g. width is exactly 10_)
- An immutable constant (_e.g. exactly 10, and cannot be changed by the user, an example being
  the left and right borders of the virtual viewport_)
- An offset from another anchor (_e.g. left is otherElement.right + 10_)
- Centered within another rectangle
- Content-dependent anchors (see below)

**Content-dependent anchors**
It is helpful for some dimensions to depend on the size of the content when rendered.
An element may have exactly one content-dependent dimension: width or height.

#### (3c) Graphical editing of anchors

Anchors will be created through a UI although the exact nature is as yet unspecified.

As such an element's anchors must be inspectable so that a future UI can know the current state
and present a UI appropriate to this.
