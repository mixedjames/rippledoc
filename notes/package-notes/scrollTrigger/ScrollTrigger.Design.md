# ScrollTrigger Design

## Overview

ScrollTrigger is a library for encapsulating scroll-triggered events. It is designed to drive animations and pinning behaviors but does not implement these features itself - that responsibility lies with the client code.

### Core Principles

1. **Immutability**: Trigger sets are immutable once created. To respond to new events, create a new trigger set.
2. **Separation of Concerns**: ScrollTrigger handles event detection and dispatching; animation/pinning logic remains in client code.
3. **Performance**: Uses RAF throttling and IntersectionObserver optimizations to minimize performance impact.

## Architecture

The library consists of four main components:

### 1. ScrollTrigger (Client Interface)

ScrollTrigger serves as the public interface for clients and provides a builder API for creating TriggerSets.

#### Builder Interface

Exposes a fluent builder API for creating immutable trigger sets. This allows clients to declaratively define scroll triggers without worrying about implementation details.

**Construction Pattern**: All TriggerSets are created through ScrollTrigger's builder. This centralized construction pattern enables future optimization to a single scroll listener per viewport, though currently each TriggerSet manages its own listener.

### 2. TriggerSet

Represents an immutable collection of related triggers that share a common viewport/scroller. TriggerSet exists to:

- **Group triggers** by their common viewport element
- **Route scroll events** from the viewport to individual Triggers
- **Enable future optimization** through IntersectionObserver (currently implemented via ActiveTriggerSet scaffolding)

**Key characteristic**: Once created, a TriggerSet cannot be modified. This immutability simplifies state management and prevents bugs from shared mutable state.

**Note**: Currently, each TriggerSet attaches its own RAF-throttled scroll listener. The centralized construction through ScrollTrigger enables future refactoring to a single listener per viewport.

### 3. Trigger

Represents a single scroll trigger with start and end points.

Each Trigger encapsulates:

- Start and end TriggerPoints defining the scroll range
- Callbacks to invoke at different lifecycle points
- State tracking for the trigger lifecycle

#### Callback API

Trigger supports five optional callbacks that cover the complete lifecycle:

- **onStart**: Called when entering the trigger range from the top (scrolling down)
- **onScroll**: Called continuously while in the active range, between start/end callback pairs
- **onEnd**: Called when exiting the trigger range at the bottom (scrolling down)
- **onReverseStart**: Called when entering the trigger range from the bottom (scrolling up)
- **onReverseEnd**: Called when exiting the trigger range at the top (scrolling up)

**Important behavior**:

- `onScroll` is always called between start/end (or reverseStart/reverseEnd) pairs
- Starting and ending progress values may not be exactly 0 or 1 due to scroll jumping (e.g., user jumps mid-way into trigger range)

### 4. TriggerPoint

Represents a single point in the scroll timeline where a trigger event occurs. TriggerPoint encapsulates:

- The element to measure from
- Position on the element (elementY: 0 = top, 1 = bottom)
- Position in the viewport (viewportY: 0 = top, 1 = bottom)
- Calculated scroll position where alignment occurs

Each Trigger has two TriggerPoints (start and end), which may reference different elements. This allows for flexible trigger configurations.

## Design Decisions

### Why Immutability?

Immutable trigger sets provide several benefits:

- Predictable behavior - no unexpected state changes
- Easier debugging - triggers behave consistently
- Thread-safety for future async operations
- Simpler mental model for users

### Why Separate Animation Logic?

By keeping animation and pinning separate, ScrollTrigger remains:

- Lightweight and focused
- Flexible - works with any animation library or approach
- Testable - trigger logic can be tested independently
- Composable - multiple animation systems can respond to the same triggers

### Why RAF Throttling?

Using `requestAnimationFrame` for scroll event handling:

- Syncs updates with browser paint cycle
- Prevents unnecessary calculations between frames
- Improves performance, especially on slower devices
- Provides consistent ~60fps update rate

### Why IntersectionObserver?

IntersectionObserver optimization (currently TODO) will allow TriggerSet to:

- Skip calculations for off-screen triggers
- Reduce CPU usage for pages with many triggers
- Leverage native browser optimizations
- Improve battery life on mobile devices

**Current Status**: ActiveTriggerSet provides the scaffolding for this optimization but currently acts as a passthrough to all triggers. This will be implemented in a future iteration.
