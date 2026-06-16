/**
 *
 *
 * Notes (11/6/2026):
 * In interation 1 the Presentation class acted both as the root "holder of things" for a
 * Presentation and the root of the tree of displayable objects.
 *
 * This has caused some issues:
 * - Initialisation is difficult because we have all sorts of order-sensitive code which is
 *   non-obvious
 * - The Presentation class has a lot of responsibilities and is quite complex
 *
 * Soo... in the new world:
 * Presentation is just a directory for other objects
 *   .root is the top-level displayable object and owns Sections (which own Elements)
 *     .physicalGeometry holds the physical geometry managed by the current View
 *   .layout holds the current layout and manages available layouts
 *
 * These objects are tightly coupled - they are not extension points or foci of abstraction, but
 * by moving closer to one-thing-one-responsibilility everything is easier to understand and
 * maintain. Hopefully.
 */
export class PresentationRoot {}
