export interface RAFThrottledScrollListenerParams {
  target: HTMLElement;
  callback: (scrollTop: number) => void;
}

export function addRAFThrottledScrollListener({
  target,
  callback,
}: RAFThrottledScrollListenerParams): void {
  let ticking = false;

  target.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(target.scrollTop);
        ticking = false;
      });
      ticking = true;
    }
  });
}
