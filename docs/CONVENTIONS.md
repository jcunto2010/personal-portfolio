# Project Conventions

Standards and rules that apply to every contributor and every PR in this repository.

---

## 1. Folder Structure

Current layout lives under `src/components/`. The intended future structure as the project scales:

```
src/
  game/
    core/       # Pure logic, state machines, game rules — no React, no DOM
    render/     # React components that visualize game state
  ui/           # Reusable UI primitives (buttons, modals, inputs)
  shared/       # Cross-cutting utilities, hooks, types, constants
  test/         # Test helpers, fixtures, mocks
```

Migration to this structure must be done incrementally; never move files without updating all import paths and verifying the build passes.

---

## 2. Stable Node IDs

Any element or data node that carries a unique identifier (`nodeId`, `id`, `key`) **must not change** across renders, route transitions, or feature versions.

- IDs are derived from stable data (e.g. slug, UUID from backend, index from a fixed dataset).
- Never generate IDs with `Math.random()` or `Date.now()` inside render.
- If an ID needs to change, that is a breaking change and must be communicated explicitly.

---

## 3. No Data Collection

This project does **not** collect user data.

- No analytics libraries (Google Analytics, Mixpanel, Amplitude, etc.)
- No session replay tools (Hotjar, FullStory, LogRocket, etc.)
- No tracking pixels or third-party beacons

**Exceptions** require an explicit allowlist entry in this file under a `## Allowlist` section, including: the tool name, the data it collects, the justification, and the PR that introduced it. No exception may be merged without this documentation.

---

## 4. Accessibility by Default

Every interactive element must be usable without a pointer device.

- All interactive elements are keyboard-reachable (`Tab`, `Shift+Tab`).
- Focus is always visible — do not suppress the default focus ring without providing an equivalent custom style.
- When modal/dialog/drawer components exist, pressing `Escape` must close them.
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`, `<article>`) before reaching for `<div>` with `role`.
- Images must have meaningful `alt` text; decorative images use `alt=""`.

---

## 5. Security

- **Never use `dangerouslySetInnerHTML`** unless the content is sanitized server-side and the usage is reviewed in PR. If used, add an inline comment explaining why and what sanitization is in place.
- All external links must include `rel="noreferrer noopener"` to prevent tab-napping and avoid leaking the referrer:
  ```tsx
  <a href="https://example.com" target="_blank" rel="noreferrer noopener">
  ```
- Do not store sensitive values (tokens, secrets, API keys) in source code or committed `.env` files. Use environment variables and add them to `.gitignore`.

---

## 6. Performance

- **Avoid unnecessary renders.** Wrap expensive computations in `useMemo`; stabilize callbacks with `useCallback` when passed as props to memoized children.
- **No premature optimization.** Do not add memoization, virtualization, or caching without a measured baseline (React DevTools Profiler, Lighthouse, or equivalent). Document the measurement in the PR description.
- Prefer lazy-loading (`React.lazy` + `Suspense`) for routes and heavy components that are not needed on initial paint.
- Keep the main JS chunk below 500 kB gzipped. If a build warning appears, investigate before merging.
