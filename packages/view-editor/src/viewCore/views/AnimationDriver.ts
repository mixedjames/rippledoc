/**
 * Interface for all animation drivers in the editor view.
 *
 * Each driver is bound to one KeyFrameAnimation. Methods map directly to the
 * ScrollTrigger event state machine — EditorAnimationManager calls them in
 * response to trigger events, gated by animationEnabled on the presentation view.
 *
 * Implementors:
 *   WaapiAnimationDriver  — CSS-animatable properties via the Web Animations API
 *   ManualAnimationDriver — abstract base for tick-driven drivers (traceStroke,
 *                           path-following, look-at, and other future mechanics)
 */
export interface AnimationDriver {
  /** Trigger entered the active range from above (scrolling down). */
  start(progress: number): void;

  /** Scroll position moved while inside the trigger range (scroll-driven only). */
  seek(progress: number): void;

  /** Trigger exited the active range downward. */
  end(progress: number): void;

  /** Trigger entered the active range from below (scrolling up). */
  reverseStart(progress: number): void;

  /** Trigger exited the active range upward. */
  reverseEnd(progress: number): void;

  /**
   * Called after every layout pass. Scroll-driven drivers re-sync their
   * internal time to the new scale without waiting for the next scroll event.
   */
  onLayout(): void;

  /**
   * Called when the animation's keyframes change. Drivers should rebuild any
   * derived state from the model's updated keyFrames array.
   */
  onKeyFramesChanged(): void;

  /**
   * Enable or disable animation playback.
   *
   * On false: immediately clear any applied visual state so the element returns
   * to its natural rendered position (no inline animation styles). On true:
   * recreate internal animation state ready to respond to trigger events.
   */
  setEnabled(enabled: boolean): void;

  destroy(): void;
}
