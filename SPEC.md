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
- `search-box.ts` exports `SearchBoxController` — tests instantiate it
  directly with `(root, dom.window)`, bypassing the web component shell
  and eliminating the need to bridge JSDOM globals onto `globalThis`
- Only `requestAnimationFrame` requires an explicit `globalThis` assignment
  — `userEvent` needs it

---

## Setup helpers

### `createDom(): Promise<{ dom, document, window, cleanup }>`

Shared async setup used by both `beforeEach` blocks. Handles:
1. Rendering `search-box-fixture.astro` via the Astro container API
2. Constructing the JSDOM instance from rendered HTML
3. Setting `globalThis.requestAnimationFrame = win.requestAnimationFrame`
   (userEvent requires the JSDOM version; this is a direct assignment, not
   `vi.stubGlobal`, so `vi.unstubAllGlobals()` does not undo it — each
   `beforeEach` re-assigns it before use)
4. Mocking `dialog.showModal` / `dialog.close`
5. Calling `vi.stubGlobal("import.meta.env", { BASE_URL: "/" })`
6. Resetting modules (`vi.resetModules`) so each test gets a fresh
   `search-box.ts` instance
7. Instantiating `SearchBoxController` via `initController`
8. Returning a `cleanup` function that resets `dialog.open` and calls
   `window.close()`

### `initController(document: Document, win: Window): Promise<SearchBoxController>`

Dynamically imports `./search-box.ts`, finds the `<search-box>` element,
instantiates `SearchBoxController`, calls `.init()`, and returns the instance
so callers can invoke `.destroy()` before re-initialising (e.g. the Mac UA test):

```ts
async function initController(document: Document, win: Window): Promise<SearchBoxController> {
  const { SearchBoxController } = await import("./search-box.ts");
  const root = document.querySelector("search-box")!;
  const controller = new SearchBoxController(root, win);
  controller.init();
  return controller;
}
```

> **Note on `win` type at call sites**: `dom.window` is `DOMWindow` (jsdom),
> not `Window` (lib.dom.d.ts). Cast at every call site:
> `initController(document, window as unknown as Window)`.

The dynamic import is required (not a top-level static import) so that
`vi.mock("./pagefind-api", …)` — called inside `beforeEach` — is in place
before `search-box.ts` imports it.

> **Note on `vi.mock` inside `beforeEach`**: `vi.mock("./pagefind-api", …)`
> is called inside `beforeEach`, not at the module top level. Vitest only
> hoists `vi.mock` when it appears at module scope; here it runs at call
> time. This is correct because `initController` uses a dynamic `import()`,
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
│   │   │   beforeEach: controller.destroy() → Object.defineProperty(win.navigator,
│   │   │               "userAgent", Mac value) → await initController(document,
│   │   │               window as unknown as Window) → store result in controller
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
| 1 result  | "clears results when user clears the input" |
| N results | "displays results when user types a search query" (existing) |

---

## What is removed

| Item | Reason |
|---|---|
| `AstroPageShell.spec.ts` | Contained only search tests; now in `search-box.spec.ts` |
| `formatCounter` unit tests | Covered by integration; isolated test adds no signal |
| All `globalThis.*` assignments | `SearchBoxController` takes `win: Window`; no bridging needed |
| `initSearchBox()` | Replaced by `initController()` which instantiates `SearchBoxController` directly |
| Manual `connectedCallback()` call | `SearchBoxController.init()` replaces it |
| Outer `describe("AstroPageShell")` wrapper | Meaningless once file is `search-box.spec.ts` |

## What is renamed

| Old | New | Reason |
|---|---|---|
| `fixtures/TestPage.astro` | `fixtures/search-box-fixture.astro` | Name reflects purpose |
| `initSearchBox()` | `initController()` | Reflects `SearchBoxController` usage |
