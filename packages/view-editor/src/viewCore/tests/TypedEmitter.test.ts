import { describe, it, expect, vi } from "vitest";
import { TypedEmitter } from "../TypedEmitter";

type Events = {
  "a": { value: number };
  "b": { label: string };
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
