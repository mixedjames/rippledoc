# Reflections on using Co-pilot as a pair programmer

My early experiences with using LLMs to code have been, shall we say, _mixed_. But my time is
hugely constrained these days: being a doctor (anaesthesia and intensive care) is my actual job, and
I have children, and a mortgage. LLMs seemed to open up a way to write more code with less grind so
I was curious to see if I could make it work for me.

These are my reflections on how it has worked so far in the RippleDoc codebase.

Its more of a stream of conciousness than a coherent document.

## Copilot has allowed me to build a large system much quicker than I would have managed without

## Copilot has enabled me to to unit testing a way that was hugely burdensome before

## Copilot has made system config easier but at the cost that I understand less

## Copilot loves to roam

Without restraint Co-pilot is very undisciplined. It will happily dip into files in totally
different parts of my monorepo.

Why is this an issue? Well, the problem is whilst in some ways Co-pilot is amazing, in others its
just not that good. It often writes convoluted code that is difficult to understand. It rarely
seems to add much structure. And sometimes, not all that rarely, it writes code that doesn't work
and breaks things.

If you can hold it back then you stand half a chance of being an informed code reviewer that can
prevent the sort of code soup and wreckage that happens otherwise. But holding it back is hard.

I have yet to find a global prompt that completely prevents it. And because of how conversations
evolve and prompt given at the start slowly fades into the background. The closest I have come so
far is having an explicit `copilot-instructions.md` and regular prompting with `Talk first, code
later`.

## Copilot likes to fiddle with surface APIs

In general there is a cost to modifications, and that cost is often related to the degree of
accessibility of what your modifying:

- Internal implementation details of a small class are likely cost free
- Details of a much larger class with composite responsibilities can be much larger
- Changes the public API have huge cost - both now, and in the future

The public API is typically designed with a great degree of scrutiny. Changes here affect clients
we don't control now. Control we expose may also limit what we can refactor or change later.

Copilot often doesn't respect this. It will quite happily trample on the public API at some times,
whilst conversely creating bizarre franken-code to avoid adding to public API at other times.

Usually the solution would have been a conversation. Sometimes the public API is just missing a key
feature, sometimes its not there for a bloody good reaon. But since it doesn't ask it doesn't know.

## Copilot isn't reliably safe

As part of making SVGs animatable in RippleDoc we fetch and include the SVG DOM inline within the parent page. There isn't really a great way to avoid this but is has fairly obvious safety
implications. Unless you are sure you control everything that might be included on a page, then this
is a backdoor by which your page could be executing code that didn't originate from either the
project or the client.

There is an obvious mitigation - purification of the included DOM by one of the many well known
libraries.

Copilot would have happily created this backdoor without even flagging it as a FIXME. I only know
the issue exists because I was closely involved in the process of building the module.

Of note, as of 15/2/26 I haven't actually fixed this myself, but that's not the point - we're still
very much in pre-alpha. The point is that, trusting Copilot alone, I simply wouldn't know it was
there.

## Copilot has a tendency to construct monoliths

Left to its own devices functions often grow to great length, as do source files. It will refactor
and suggest reasonably good refactors, but by default we build monoliths.
