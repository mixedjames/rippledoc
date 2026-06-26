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
   * Called after every layout pass with the current basis→pixel scale factor.
   * Drivers that use basis-unit values (translate, backgroundPosition) rebuild
   * their CSS keyframes so the animation scales correctly with the viewport.
   * Scroll-driven drivers also re-sync internal time to the new scale.
   */
  onLayout(scale: number): void;

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

  /**
   * Transfers this animation to a different DOM element, preserving playback
   * state. Called when EditorPinManager switches between the live element and
   * its non-scrolling pin clone.
   */
  retarget(element: Element): void;

  destroy(): void;
}
