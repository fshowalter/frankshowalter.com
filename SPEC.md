# Search Box Test Suite — Spec

## Goal

Consolidate all search-related tests into a single, well-structured
`search-box.spec.ts`. Remove `AstroPageShell.spec.ts` (it contains only
search tests). Replace isolated `formatCounter` unit tests with integration
coverage.

---

## File structure (target state)

```
src/astro/
├── search-box.spec.ts   ← single home for all search tests
├── search-box.ts
├── AstroPageShell.astro
├── fixtures/
│   └── search-box-fixture.astro  ← renamed from TestPage.astro
└── ...
```

`AstroPageShell.spec.ts` is deleted.

---

## Test environment

- Vitest project: `layouts-node` (Node environment, no automatic DOM)
- JSDOM constructed manually from Astro-rendered HTML
- Globals installed via `installWindowGlobals(win)` blanket helper (see below)
- `requestAnimationFrame` kept as an explicit polyfill — userEvent needs it

---

## Setup helpers

### `installWindowGlobals(win: DOMWindow): void`

Installs all non-underscore JSDOM window properties onto `globalThis` on
every call. The `configurable: true` override ensures subsequent calls (one
per test) can redefine properties that still point to the previous JSDOM
instance. Silently skips any property that cannot be defined on `globalThis`.

```ts
function installWindowGlobals(win: DOMWindow) {
  for (const key of Object.getOwnPropertyNames(win)) {
    if (key.startsWith("_")) continue;
    try {
      Object.defineProperty(globalThis, key, {
        ...Object.getOwnPropertyDescriptor(win, key)!,
        configurable: true,
      });
    } catch {}
  }
}
```

**Important**: do _not_ add a `key in globalThis` guard. Tests create a fresh
JSDOM instance each run; globals must be updated to the new instance or tests
2+ will operate on a stale DOM.

Globals that were previously installed by hand but are **not** needed as
explicit lines (the blanket helper installs them automatically):
- `requestIdleCallback` — not referenced by `search-box.ts` or any import
- `HTMLInputElement` — TypeScript generic only, no runtime use
- `HTMLButtonElement` — same

### `createDom(): Promise<{ dom, document, window, cleanup }>`

Shared async setup used by both `beforeEach` blocks. Handles:
1. Rendering `search-box-fixture.astro` via the Astro container API
2. Constructing the JSDOM instance from rendered HTML
3. Calling `installWindowGlobals`
4. Setting `requestAnimationFrame` explicitly after `installWindowGlobals`
   (userEvent requires the JSDOM version; the explicit assignment wins over
   whatever Node or the blanket helper may have set)
5. Mocking `dialog.showModal` / `dialog.close`
6. Calling `vi.stubGlobal("import.meta.env", { BASE_URL: "/" })`
7. Resetting modules (`vi.resetModules`) so each test gets a fresh
   `search-box.ts` instance
8. Initialising the `<search-box>` custom element via `initSearchBox`
9. Returning a `cleanup` function that resets `dialog.open` and calls
   `window.close()`

### `initSearchBox(document: Document): Promise<void>`

Unchanged from the current implementation: dynamically imports
`./search-box.ts` then manually calls `connectedCallback()`.

> **Note on `vi.mock` inside `beforeEach`**: `vi.mock("./pagefind-api", …)`
> is called inside `beforeEach`, not at the module top level. Vitest only
> hoists `vi.mock` when it appears at module scope; here it runs at call
> time. This is correct because `initSearchBox` uses a dynamic `import()`,
> which consults the mock registry at runtime. Do not move it to top level.

---

## Test structure

```
search-box.spec.ts
│
├── describe("search modal")           ← real timers
│   │   beforeEach: createDom()
│   │   afterEach:  cleanup + vi.clearAllMocks + vi.unstubAllGlobals
│   │
│   ├── describe("on initial render")
│   │   ├── renders search button
│   │   ├── renders close button
│   │   ├── renders dialog element
│   │   └── enables search button after initialization
│   │
│   ├── describe("on Mac")
│   │   └── sets Mac keyboard shortcut
│   │
│   ├── describe("when search button is clicked")
│   │   └── opens modal
│   │
│   ├── describe("when modal is open")
│   │   ├── closes when close button is clicked
│   │   ├── closes when clicking outside dialog frame
│   │   ├── does not close when clicking inside dialog frame
│   │   └── closes when clicking on a link
│   │
│   ├── describe("when Cmd+K is pressed")
│   │   ├── opens modal
│   │   └── closes modal when already open
│   │
│   ├── describe("when Ctrl+K is pressed")
│   │   └── opens modal
│   │
│   ├── describe("when Enter is pressed in search input")
│   │   └── blurs search input
│   │
│   └── describe("when clear button is clicked")
│       └── focuses search input
│
└── describe("search functionality")   ← fake timers + mock PagefindAPI
    │   beforeEach: vi.useFakeTimers + vi.mock("./pagefind-api") + createDom()
    │               + userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    │   afterEach:  cleanup + vi.clearAllMocks + vi.useRealTimers
    │               + vi.unstubAllGlobals
    │
    ├── describe("when searching")
    │   ├── displays results when user types a search query
    │   │     — also asserts "1 result for …" (singular) counter text
    │   ├── shows no results message when search returns empty
    │   ├── shows loading state while searching
    │   ├── clears results when user clears the input
    │   ├── shows and hides clear button based on input
    │   ├── clears search when user clicks clear button
    │   └── discards results from a stale search when a newer search resolves
    │
    └── describe("when loading more results")
        └── loads more results when user clicks load more button
```

### `beforeEach` ordering for "search functionality"

```ts
vi.useFakeTimers({ shouldAdvanceTime: true });
vi.mock("./pagefind-api", async () => { … });
// vi.mock factories live in a separate registry that survives vi.resetModules,
// so the relative order of vi.mock vs vi.resetModules (inside createDom) does
// not affect correctness.
const { document, window, cleanup } = await createDom();
user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime, document });
```

### formatCounter coverage via integration

`formatCounter` is not tested in isolation. Integration tests assert the
counter element's `textContent` directly:

| Case | Covered by |
|---|---|
| 0 results | "shows no results message when search returns empty" |
| 1 result  | "displays results when user types a search query" (added) |
| N results | "displays results when user types a search query" (existing) |

---

## What is removed

| Item | Reason |
|---|---|
| `AstroPageShell.spec.ts` | Contained only search tests; now in `search-box.spec.ts` |
| `formatCounter` unit tests | Covered by integration; isolated test adds no signal |
| Hand-curated `globalThis` list | Replaced by `installWindowGlobals` blanket helper |
| `requestIdleCallback` explicit line | Not used by `search-box.ts`; blanket helper installs it |
| `HTMLInputElement` / `HTMLButtonElement` explicit lines | TypeScript-only; blanket helper installs them |
| Outer `describe("AstroPageShell")` wrapper | Meaningless once file is `search-box.spec.ts` |

## What is renamed

| Old | New | Reason |
|---|---|---|
| `fixtures/TestPage.astro` | `fixtures/search-box-fixture.astro` | Name reflects purpose |
