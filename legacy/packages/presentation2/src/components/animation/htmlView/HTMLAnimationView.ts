/**
 * Represents a common base-class for the HTML realisation of different types of animation:
 * - HTMLKeyFrameAnimationView
 * - HTMLPinView
 * - HTMLAnimateAlongPathView (possible future pattern)
 *
 */
export interface HTMLAnimationView {
  disconnect(): void;

  layout(): void;

  animatableObjectModified(): void;
}
