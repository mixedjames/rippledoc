# GitHub Copilot Instructions for This Project

## Scope of Changes

- Only modify files I explicitly mention, unless I clearly say otherwise.
- Do not make stylistic or “cleanup” changes (quotes, imports, exports, formatting) unless I explicitly ask.
- Do not rename, move, or delete files without asking first.

## Style & Conventions

- Match the existing style in the file you’re editing (imports, quotes, spacing, etc.).
- Prefer keeping existing public APIs and types unchanged unless the task requires it.
- Avoid introducing new dependencies unless I request or approve them.

## Workflow & Communication

- For anything non-trivial:
  - First: describe the plan and the minimal set of files you’ll touch.
  - Then: implement exactly that plan (no extra refactors).
- Make it easy to review:
  - Keep changes as small and focused as possible.
  - Don’t mix unrelated fixes/cleanups into the same patch.

## Testing

- When you change behavior, tell me:
  - What tests/commands you recommend running (e.g. `npm test`).
  - Any specific areas or scenarios that are affected.

## Error Handling & Uncertainty

- If something is ambiguous, prefer asking a brief clarifying question over guessing.
- If you’re not sure a change is correct, say so explicitly and explain the trade-offs.
