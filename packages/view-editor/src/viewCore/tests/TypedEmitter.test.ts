import { describe, it, expect, vi } from "vitest";
import { TypedEmitter } from "../TypedEmitter";

type Events = {
  a: { value: number };
  b: { label: string };
};

describe("TypedEmitter — on / emit", () => {
  it("listener receives the emitted payload", () => {
    const emitter = new TypedEmitter<Events>();
    const listener = vi.fn();
    emitter.on("a", listener);

    emitter.emit("a", { value: 42 });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ value: 42 });
  });

  it("multiple listeners on the same event all fire", () => {
    const emitter = new TypedEmitter<Events>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    emitter.on("a", l1);
    emitter.on("a", l2);

    emitter.emit("a", { value: 1 });

    expect(l1).toHaveBeenCalledOnce();
    expect(l2).toHaveBeenCalledOnce();
  });

  it("emitting one event does not fire listeners for another event", () => {
    const emitter = new TypedEmitter<Events>();
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    emitter.on("a", listenerA);
    emitter.on("b", listenerB);

    emitter.emit("a", { value: 1 });

    expect(listenerA).toHaveBeenCalledOnce();
    expect(listenerB).not.toHaveBeenCalled();
  });

  it("emitting with no listeners is a no-op", () => {
    const emitter = new TypedEmitter<Events>();
    expect(() => emitter.emit("a", { value: 0 })).not.toThrow();
  });
});

describe("TypedEmitter — unsubscribe", () => {
  it("on() returns a function that stops delivery when called", () => {
    const emitter = new TypedEmitter<Events>();
    const listener = vi.fn();
    const unsubscribe = emitter.on("a", listener);

    emitter.emit("a", { value: 1 });
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    emitter.emit("a", { value: 2 });
    expect(listener).toHaveBeenCalledOnce(); // still just once
  });

  it("unsubscribing one listener does not affect others on the same event", () => {
    const emitter = new TypedEmitter<Events>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    const unsub1 = emitter.on("a", l1);
    emitter.on("a", l2);

    unsub1();
    emitter.emit("a", { value: 1 });

    expect(l1).not.toHaveBeenCalled();
    expect(l2).toHaveBeenCalledOnce();
  });
});

describe("TypedEmitter — mutation during emit", () => {
  it("a listener that unsubscribes itself during emit is not called again", () => {
    const emitter = new TypedEmitter<Events>();
    let callCount = 0;
    let unsub: () => void;
    // eslint-disable-next-line prefer-const
    unsub = emitter.on("a", () => {
      callCount++;
      unsub(); // self-unsubscribe during the emit
    });

    emitter.emit("a", { value: 1 });
    emitter.emit("a", { value: 2 }); // must not fire again

    expect(callCount).toBe(1);
  });

  it("a listener that unsubscribes a later listener prevents that listener from firing in the same emit", () => {
    // ECMAScript Set iteration: deleting an entry that has not yet been visited
    // means it will not be visited. This documents that observable behaviour
    // rather than treating it as an implementation detail.
    const emitter = new TypedEmitter<Events>();
    const l2 = vi.fn();
    let unsub2: () => void;

    emitter.on("a", () => {
      unsub2(); // unsubscribe l2 before the iterator reaches it
    });
    // eslint-disable-next-line prefer-const
    unsub2 = emitter.on("a", l2);

    emitter.emit("a", { value: 1 });

    expect(l2).not.toHaveBeenCalled();
  });
});
